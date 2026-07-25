"use strict";
var cloneDeep = require('lodash.clonedeep');
const database = require('./database.js')
const express = require('express')
const pino = require('pino');
const expressPino = require('express-pino-logger');
const crypto = require('crypto');

const logger = pino({level: process.env.LOG_LEVEL || 'info'});
const expressLogger = expressPino({logger});
const expressApp = express();
import {Constants} from '../briscola/js/Constants.js'
import Lobbies from './Lobbies'

const http = require('http').createServer(expressApp);

const Server = require('socket.io')
const io = Server(http, {pingTimeout: 10000});


import {Game} from "../briscola/js/Game.js"

var session = require("express-session")({
    // Signing secret for the connect.sid cookie. Never hard-code it: a known
    // or guessable secret lets an attacker forge validly-signed session
    // cookies. Load it from the environment; fall back to a random per-boot
    // secret when unset (that invalidates existing sessions on restart, which
    // is safe here as clients rebind on reconnect).
    // NOTE: also set `cookie: { secure: true }` once the site is served over
    // TLS. resave/saveUninitialized are intentionally left as-is because the
    // socket turn-authorization currently relies on the per-connection session.
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

expressApp.use(expressLogger);

// Use express-session middleware for express
expressApp.use(session);


// Use shared session middleware for socket.io
// setting autoSave:true
io.use(sharedsession(session, {
    autoSave: true
}));


// --- Security: per-recipient game redaction -------------------------------
// The raw game object holds BOTH players' hands and the entire undrawn deck
// in draw order. Emitting it to every client leaks the opponent's hand and
// lets any player predict every future draw (see the game-state-disclosure
// finding). Build a view that keeps only what the recipient is entitled to
// (their own hand, the public trump, piles, scores) and replaces the
// opponent's hand and the undrawn deck with same-length placeholders, so the
// client still renders the right number of card backs / remaining-deck size
// without any hidden values ever reaching the wire.
function redactCards(cards) {
    return Array.isArray(cards) ? cards.map(function () { return {rank: null, suit: null}; }) : cards;
}

function redactGameForPlayer(game, index) {
    const view = cloneDeep(game);
    view.playerForClientSide = view.players[index];

    const opponent = view.players[1 - index];
    if (opponent && opponent.hand) {
        opponent.hand.cards = redactCards(opponent.hand.cards);
    }
    if (view.deck) {
        view.deck.cards = redactCards(view.deck.cards);
    }
    return view;
}

function BackendServer() {
    expressApp.use(express.static(__dirname))

    const lobbies = new Lobbies(io);

    function getSocketBySocketId(socketId) {
        return io.sockets.connected[socketId]
    }

    function isSocketConnected(socketId) {
        const connectedSocket = getSocketBySocketId(socketId)
        return (connectedSocket != undefined)
    }

    io.on('connection', function (socket) {
        function emitEvent(game, event, data) {
            game.players.forEach(function (player, index) {
                if (socket.id === player.socketId) {
                    //the current player made this request so we have to send it normally with socket.emit()
                    socket.emit(event, data)
                } else {
                    //this player is not the current socket, so we can send a message to the default room of this player with .emit()
                    io.to(player.socketId).emit(event, data)
                }

            })
        }

        logger.info('a user connected', socket.id);
        let session = socket.handshake.session;
        socket.on(Constants.events.REQUEST_GAME_START, async function (playerName) {
            if (socket.handshake.query.gameId) {
                let existing = await database.getGame(socket.handshake.query.gameId);
                if (!existing) {
                    return;
                }
                if (existing.started) {
                    //this game already started. The user refreshed the page on an existing game. Redirecting to new game
                    socket.emit(Constants.events.REDIRECT, `/new?name=${playerName}&gameType=${existing.gameType}`)
                    return;
                }

                // Atomically claim a free seat (fixes the seat-hijack race and
                // removes the "default to seat 0" clobber on a full game).
                const claim = await database.claimSeat(socket.handshake.query.gameId, socket.id, playerName)
                if (!claim) {
                    //no free seat (game full or already started) — send elsewhere
                    //instead of overwriting player 1's seat.
                    socket.emit(Constants.events.REDIRECT, `/new?name=${playerName}&gameType=${existing.gameType}`)
                    return;
                }

                let game = claim.game;
                let playerIndex = claim.playerIndex;
                session.playerIndex = playerIndex
                session.gameId = game._id
                game.playerForClientSide = game.players[playerIndex]

                lobbies.addLobby(game);
                if (game.players[0].socketId && game.players[1].socketId) {
                    const isPlayer1Connected = isSocketConnected(game.players[0].socketId)
                    const isPlayer2Connected = isSocketConnected(game.players[1].socketId)
                    if (isPlayer1Connected && isPlayer2Connected) {
                        game.started = true;
                        await database.saveGame(game)
                        emitGetGame(game)
                        lobbies.removeLobby(game);
                    } else {
                        if (!isPlayer1Connected) {
                            //player 1 left
                            logger.info("Player 1 left before game could be started.. Resetting player 1", game._id)
                            game.players[0].socketId = undefined//waits for another player
                            if (game.player1) game.player1.socketId = undefined
                        }
                        if (!isPlayer2Connected) {
                            //player 2 left
                            logger.info("Player 2 left before game could be started.. Resetting player 2", game._id)
                            game.players[1].socketId = undefined//waits for another player
                            if (game.player2) game.player2.socketId = undefined
                        }
                        //persist the freed seat so the claim is actually released
                        await database.saveGame(game)
                    }

                }

            }

            function emitGetGame(game) {
                game.players.forEach(function (player, index) {
                    const view = redactGameForPlayer(game, index)
                    if (socket.id === player.socketId) {
                        //the current player made this request so we have to send it normally with socket.emit()
                        socket.emit(Constants.events.GET_GAME, view)
                    } else {
                        //this player is not the current socket, so we can send a message to the default room of this player with .emit()
                        io.to(player.socketId).emit(Constants.events.GET_GAME, view)
                    }

                })
            }


        })
        socket.on(Constants.events.REQUEST_SINGLE_PLAYER_GAME_START, async function () {
            if (socket.handshake.query.gameId) {
                let game = await database.getGame(socket.handshake.query.gameId);
                if (game.started) {
                    //this game already started. The user refreshed the page on an existing game. Redirecting to new game
                    socket.emit(Constants.events.REDIRECT, "/newAgainstComputer")
                    return;
                }
                let playerIndex = 0;
                game.player1.socketId = socket.id
                session.playerIndex = playerIndex
                session.gameId = game._id

                game.players[playerIndex].socketId = socket.id;
                game.playerForClientSide = game.players[playerIndex]

                game.started = true;
                await database.saveGame(game)
                emitGetGame(game)
            }

            function emitGetGame(game) {
                game.players.forEach(function (player, index) {
                    const view = redactGameForPlayer(game, index)
                    if (socket.id === player.socketId) {
                        //the current player made this request so we have to send it normally with socket.emit()
                        socket.emit(Constants.events.GET_GAME, view)
                    } else {
                        //this player is not the current socket, so we can send a message to the default room of this player with .emit()
                        io.to(player.socketId).emit(Constants.events.GET_GAME, view)
                    }

                })
            }


        })
        socket.on(Constants.events.CARD_PLAYED, async function (cardPlayed) {
            const gameFromDb = await database.getGame(socket.handshake.query.gameId);
            if (gameFromDb == undefined) {
                console.error("Undefined game?")
            }
            if (gameFromDb.currentPlayerToActByIndex === session.playerIndex) {
                //player is allowed to act (backend check)
                let game = new Game(gameFromDb);
                let playerIndex = session.playerIndex;
                let player = game.players[playerIndex];
                game.playerForClientSide = player
                let playerHand = player.hand;
                game.addCardToHistory(cardPlayed, playerIndex);
                playerHand.removeCard(cardPlayed)//remove card from player's hand
                let middlePile = game.middlePile
                middlePile.addCard(cardPlayed)//add card to middle pile

                game.next()
                socket.emit(Constants.events.CARD_PLAYED_CONFIRMED, cardPlayed)//notify client to remove the card from his hand
                computerMove(game, Constants.events.COMPUTER_CARD_PLAYED);
                if (game.isRoundOver()) {
                    let winningPlayer = game.getWinningPlayer()
                    winningPlayer.pile.addCards(game.middlePile.cards)

                    if (game.isLastDeal()) {
                        emitEvent(game, Constants.events.LAST_DEAL)//should be a condition to only send this event once
                    }
                    if (!game.isDeckEmpty()) {
                        game.dealNextCardToAllPlayers()
                    }

                    let winningPlayerIndex = game.getWinningPlayerIndex(game.trumpSuit)
                    game.currentPlayerToActByIndex = winningPlayerIndex
                    game.firstPlayerToActByIndex = game.currentPlayerToActByIndex;

                    game.middlePile.reset()//reset only after dealing the next cards

                    if (game.isGameOver()) {
                        game.players[0].points = game.players[0].pile.countPoints()
                        game.players[1].points = game.players[1].pile.countPoints()
                        emitGameOver(game)
                    }

                    // Don't ship the winner's hand to the loser. The client
                    // ignores this payload's contents, but it must not leak on
                    // the wire; send a copy with the hand redacted.
                    const roundWinnerView = cloneDeep(winningPlayer)
                    if (roundWinnerView.hand) {
                        roundWinnerView.hand.cards = redactCards(roundWinnerView.hand.cards)
                    }
                    emitEvent(game, Constants.events.ROUND_OVER, roundWinnerView)
                }

                emitEvent(game, Constants.events.CARD_PLAYED, cardPlayed)//tell clients that a card was played so that it will get displayed

                computerMove(game, Constants.events.FIRST_TO_ACT_COMPUTER_CARD_PLAYED)

                await database.saveGame(game)//wait for the game object to update before we emit the update
                emitUpdateGame(game)
            } else {
                socket.emit(Constants.events.CARD_PLAYED_REJECTED)
                logger.info("Card could not be played: ", cardPlayed)
            }

            function computerMove(game, event) {
                const card = game.computerMove();
                if (card != null) {
                    //a card was played
                    emitEvent(game, event, card)//tell client that a computer card was played so that it will get displayed
                }

            }


        })

        function emitUpdateGame(game) {
            game.players.forEach(function (player, index) {
                const view = redactGameForPlayer(game, index)
                if (socket.id === player.socketId) {
                    //the current player made this request so we have to send it normally with socket.emit()
                    socket.emit(Constants.events.UPDATE_GAME, view)
                } else {
                    //this player is not the current socket, so we can send a message to the default room of this player with .emit()
                    io.to(player.socketId).emit(Constants.events.UPDATE_GAME, view)
                }
            })
        }

        function emitGameOver(game) {
            game.players.forEach(function (player, index) {
                const view = redactGameForPlayer(game, index)
                if (socket.id === player.socketId) {
                    socket.emit(Constants.events.GAME_OVER, view)
                } else {
                    io.to(player.socketId).emit(Constants.events.GAME_OVER, view)
                }
            })
        }

        socket.on(Constants.events.CALL_BRISK, async function (suit) {
            const gameFromDb = await database.getGame(socket.handshake.query.gameId);
            if (gameFromDb == undefined) {
                console.error("Undefined game?")
            }

            if (gameFromDb.currentPlayerToActByIndex === session.playerIndex) {
                //player is allowed to act (backend check)
                let game = new Game(gameFromDb);
                let playerIndex = session.playerIndex;
                let player = game.players[playerIndex];
                let playerCanCallBrisk = player.hand.checkIfHandContainsHorseAndKingOf(suit);

                if (playerCanCallBrisk) {
                    game.trumpSuit = suit;
                    await database.saveGame(game)

                    emitEvent(game, Constants.events.BRISK_CALLED, suit);
                    emitUpdateGame(game)
                }
            }
        })

        socket.on(Constants.events.MISDEAL, async function () {
            const gameFromDb = await database.getGame(socket.handshake.query.gameId);
            if (gameFromDb == undefined) {
                console.error("Undefined game?")
                return;
            }

            if (gameFromDb.currentPlayerToActByIndex === session.playerIndex) {
                let game = new Game(gameFromDb);
                let playerIndex = session.playerIndex;
                let player = game.players[playerIndex];

                const isFirstRound = game.players.every(p => p.pile.cards.length === 0);
                const handPoints = player.hand.cards.reduce((sum, card) => {
                    const points = Constants.gameConstants.MAP_RANK_TO_NUMBER_OF_POINTS[card.rank] || 0;
                    return sum + points;
                }, 0);

                if (isFirstRound && handPoints < 5) {
                    game.players[0].points = 0;
                    game.players[1].points = 0;
                    emitGameOver(game)
                }
            }
        })

        socket.on(Constants.events.CARD_PLAYED, async function (cardPlayed) {
        })
        socket.on('disconnect', async function () {
            logger.info('user with socket id ' + socket.id + 'has disconnected');
            const socketIdOfPlayerWhoDisconnected = socket.id
            if (socketIdOfPlayerWhoDisconnected != undefined) {
                const gamesWithAPlayerThatQuit = await database.getGamesByPlayerSocketId(socketIdOfPlayerWhoDisconnected)
                gamesWithAPlayerThatQuit.forEach(gameWithAPlayerThatQuit => {
                    if (gameWithAPlayerThatQuit.players) {
                        gameWithAPlayerThatQuit.players.forEach(player => {
                            const playerSocketId = player.socketId
                            if (isSocketConnected(playerSocketId)) {
                                logger.info("Notified player " + playerSocketId + " that their opponent has disconnected")
                                getSocketBySocketId(playerSocketId).emit(Constants.events.PLAYER_LEFT, socketIdOfPlayerWhoDisconnected)
                            }
                        })
                    }
                })
            }

        });
    });
    expressApp.get("/join", listActiveLobbies)
    expressApp.get("/new", makeNewGame)
    expressApp.get("/newAgainstComputer", makeNewSinglePlayerGame)

    function listActiveLobbies(req, res) {
        lobbies.purgeEmptyLobbies();
        res.json(lobbies.getLobbies())
    }

    function makeNewGame(req, res) {
        const gameType = req.query.gameType
        let game = new Game({gameType: gameType})
        game.init()

        database.insertNewGame(game).then((confirmation) => {
            if (confirmation && confirmation.insertedId) {
                logger.info(confirmation.insertedId)
            } else logger.info("Confirmation was undefined")

            const playerName = req.query.name
            redirectToNewGamePage(res, confirmation.insertedId.toString(), playerName, gameType)
        })
    }

    function makeNewSinglePlayerGame(req, res) {
        let game = new Game()
        game.singlePlayer = true;
        game.init()

        database.insertNewGame(game).then((confirmation) => {
            if (confirmation && confirmation.insertedId) {
                logger.info(confirmation.insertedId)
            } else logger.info("Confirmation was undefined")
            redirectToNewSinglePlayerGamePage(res, confirmation.insertedId.toString())
        })
    }

    function redirectToNewGamePage(res, gameId, playerName, gameType) {
        if (res && res.redirect) {
            res.redirect("../game.html?gameId=" + gameId + "&name=" + playerName + "&gameType=" + gameType)
        }
    }

    function redirectToNewSinglePlayerGamePage(res, gameId) {
        if (res && res.redirect) {
            res.redirect("../game.html?gameId=" + gameId + "&singlePlayer=true")
        }
    }

    http.listen(3000, 'backend', function () {
        console.log('listening on *:3000');
        logger.info('listening on *:3000');
    });
}

let backend = new BackendServer();

