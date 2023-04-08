"use strict";
var cloneDeep = require('lodash.clonedeep');
const database = require('../database.js')
const express = require('express')
const pino = require('pino');
const expressPino = require('express-pino-logger');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });
const expressApp = express();
import { Constants } from '../Constants.js'
import Lobbies  from './Lobbies'

const http = require('http').createServer(expressApp);

const Server = require('socket.io')
const io = Server(http, {pingTimeout: 10000});



import { Game } from "../Game.js"

var session = require("express-session")({
    secret: "my-secret",
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
    autoSave:true
}));


function BackendServer() {
    expressApp.use(express.static(__dirname))

    const lobbies = new Lobbies(io);

    function getSocketBySocketId(socketId)
    {
        return io.sockets.connected[socketId]
    }
    function isSocketConnected(socketId)
    {
        const connectedSocket = getSocketBySocketId(socketId)
        return (connectedSocket != undefined)
    }
    io.on('connection', function (socket) {
        function emitEvent(game, event, data)
        {
            game.players.forEach(function (player, index) {
                if(socket.id === player.socketId)
                {
                    //the current player made this request so we have to send it normally with socket.emit()
                    socket.emit(event, data)
                }
                else
                {
                    //this player is not the current socket, so we can send a message to the default room of this player with .emit()
                    io.to(player.socketId).emit(event, data)
                }
               
            })
        }
        logger.info('a user connected', socket.id);
        let session = socket.handshake.session;
        socket.on(Constants.events.REQUEST_GAME_START, async function(playerName){
            if(socket.handshake.query.gameId)
            {
                let game = await database.getGame(socket.handshake.query.gameId);
                if(game.started)
                {
                    //this game already started. The user refreshed the page on an existing game. Redirecting to new game
                    socket.emit(Constants.events.REDIRECT, "/new?name=playerName")
                    return;
                }
                let playerIndex = 0;
                if (game.players[0].socketId == undefined) {
                    playerIndex = 0;
                    game.player1.socketId = socket.id
                }
                else if (game.players[1].socketId == undefined) {
                    //len 1
                    playerIndex = 1;
                    game.player2.socketId = socket.id
                }
                session.playerIndex = playerIndex
                session.gameId = game._id
    
                game.players[playerIndex].socketId = socket.id;
                game.players[playerIndex].name = playerName;
                game.playerForClientSide = game.players[playerIndex]
    
                await database.saveGame(game)
                lobbies.addLobby(game);
                if(game.players[0].socketId && game.players[1].socketId)
                {
                    const isPlayer1Connected = isSocketConnected(game.players[0].socketId)
                    const isPlayer2Connected = isSocketConnected(game.players[1].socketId)
                    if(isPlayer1Connected && isPlayer2Connected)
                    {
                        game.started = true;
                        await database.saveGame(game)
                        emitGetGame(game)
                        lobbies.removeLobby(game);
                    }
                    else
                    {
                        if(!isPlayer1Connected)
                        {
                            //player 1 left
                            logger.info("Player 1 left before game could be started.. Resetting player 1", game._id)
                            game.players[0].socketId = undefined//waits for another player
                        }
                        if(!isPlayer2Connected)
                        {
                            //player 2 left
                            logger.info("Player 2 left before game could be started.. Resetting player 2", game._id)
                            game.players[1].socketId = undefined//waits for another player
                        }
                    }
                    
                }
    
            }
            function emitGetGame(game)
            {
                game.players.forEach(function (player, index) {
                    const deepCopyGame = cloneDeep(game)
                    deepCopyGame.playerForClientSide = deepCopyGame.players[index];
                    if(socket.id === player.socketId)
                    {
                        //the current player made this request so we have to send it normally with socket.emit()
                        socket.emit(Constants.events.GET_GAME, deepCopyGame)
                    }
                    else
                    {
                        //this player is not the current socket, so we can send a message to the default room of this player with .emit()
                        io.to(player.socketId).emit(Constants.events.GET_GAME, deepCopyGame)
                    }
                   
                })
            }
           

        })
        socket.on(Constants.events.REQUEST_SINGLE_PLAYER_GAME_START, async function(){
            if(socket.handshake.query.gameId)
            {
                let game = await database.getGame(socket.handshake.query.gameId);
                if(game.started)
                {
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
            function emitGetGame(game)
            {
                game.players.forEach(function (player, index) {
                    const deepCopyGame = cloneDeep(game)
                    deepCopyGame.playerForClientSide = deepCopyGame.players[index];
                    if(socket.id === player.socketId)
                    {
                        //the current player made this request so we have to send it normally with socket.emit()
                        socket.emit(Constants.events.GET_GAME, deepCopyGame)
                    }
                    else
                    {
                        //this player is not the current socket, so we can send a message to the default room of this player with .emit()
                        io.to(player.socketId).emit(Constants.events.GET_GAME, deepCopyGame)
                    }
                   
                })
            }
           

        })
        socket.on(Constants.events.CARD_PLAYED, async function(cardPlayed)
        {
            const gameFromDb = await database.getGame(socket.handshake.query.gameId);
            if(gameFromDb == undefined)
            {
                console.error("Undefined game?")
            }
            if(gameFromDb.currentPlayerToActByIndex === session.playerIndex)
            {
                //player is allowed to act (backend check)
                let game = Game(gameFromDb);
                let playerIndex = session.playerIndex;
                let player = game.players[playerIndex];
                game.playerForClientSide = player
                let playerHand = player.hand;
                game.addCardToHistory(cardPlayed,playerIndex);
                playerHand.removeCard(cardPlayed)//remove card from player's hand
                let middlePile = game.middlePile
                middlePile.addCard(cardPlayed)//add card to middle pile

                game.next()
                socket.emit(Constants.events.CARD_PLAYED_CONFIRMED, cardPlayed)//notify client to remove the card from his hand
                computerMove(game, Constants.events.COMPUTER_CARD_PLAYED);
                if(game.isRoundOver())
                {
                    let winningPlayer = game.getWinningPlayer()
                    winningPlayer.pile.addCards(game.middlePile.cards)
                    
                    if(game.isLastDeal())
                    {
                        emitEvent(game, Constants.events.LAST_DEAL)//should be a condition to only send this event once
                    }
                    if(!game.isDeckEmpty())
                    {
                        game.dealNextCardToAllPlayers()
                    }

                    let winningPlayerIndex =  game.getWinningPlayerIndex()
                    game.currentPlayerToActByIndex = winningPlayerIndex
                    game.firstPlayerToActByIndex = game.currentPlayerToActByIndex;

                    game.middlePile.reset()//reset only after dealing the next cards
                   
                    if(game.isGameOver())
                    {
                        game.players[0].points = game.players[0].pile.countPoints()
                        game.players[1].points = game.players[1].pile.countPoints()
                        emitGameOver(game)
                    }
                    
                    emitEvent(game, Constants.events.ROUND_OVER, winningPlayer)
                }

                emitEvent(game,Constants.events.CARD_PLAYED, cardPlayed)//tell clients that a card was played so that it will get displayed

                computerMove(game, Constants.events.FIRST_TO_ACT_COMPUTER_CARD_PLAYED)

                await database.saveGame(game)//wait for the game object to update before we emit the update
                emitUpdateGame(game)
            }
            else
            {
                socket.emit(Constants.events.CARD_PLAYED_REJECTED)
                logger.info("Card could not be played: ", cardPlayed)
            }
            function computerMove(game, event) {
                const card = game.computerMove();
                if(card != null) {
                    //a card was played
                    emitEvent(game, event, card)//tell client that a computer card was played so that it will get displayed
                }

            }
            function emitGameOver(game)
            {
                game.players.forEach(function (player, index) {
                    const deepCopyGame = cloneDeep(game)
                    deepCopyGame.playerForClientSide = deepCopyGame.players[index];
                    if(socket.id === player.socketId)
                    {
                        //the current player made this request so we have to send it normally with socket.emit()
                        socket.emit(Constants.events.GAME_OVER, deepCopyGame)
                    }
                    else
                    {
                        //this player is not the current socket, so we can send a message to the default room of this player with .emit()
                        io.to(player.socketId).emit(Constants.events.GAME_OVER, deepCopyGame)
                    }
                })
            }
            function emitUpdateGame(game)
            {
                game.players.forEach(function (player, index) {
                    const deepCopyGame = cloneDeep(game)
                    deepCopyGame.playerForClientSide = deepCopyGame.players[index];
                    if(socket.id === player.socketId)
                    {
                        //the current player made this request so we have to send it normally with socket.emit()
                        socket.emit(Constants.events.UPDATE_GAME, deepCopyGame)
                    }
                    else
                    {
                        //this player is not the current socket, so we can send a message to the default room of this player with .emit()
                        io.to(player.socketId).emit(Constants.events.UPDATE_GAME, deepCopyGame)
                    }
                })
            }
            
        })
        socket.on('disconnect', async function(){
            logger.info('user with socket id ' + socket.id + 'has disconnected');
            const socketIdOfPlayerWhoDisconnected = socket.id
            if(socketIdOfPlayerWhoDisconnected != undefined)
            {
                const gamesWithAPlayerThatQuit = await database.getGamesByPlayerSocketId(socketIdOfPlayerWhoDisconnected)
                gamesWithAPlayerThatQuit.forEach(gameWithAPlayerThatQuit=>{
                    if(gameWithAPlayerThatQuit.players)
                    {
                        gameWithAPlayerThatQuit.players.forEach(player=>{
                            const playerSocketId = player.socketId
                            if(isSocketConnected(playerSocketId))
                            {
                                logger.info("Notified player "+ playerSocketId+ " that their opponent has disconnected")
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
        let game = Game()
        game.init()
        
        database.insertNewGame(game).then((confirmation)=>{
            if(confirmation && confirmation.insertedId)
            {
                logger.info(confirmation.insertedId)
            }
            else logger.info("Confirmation was undefined")

            const playerName = req.query.name
            redirectToNewGamePage(res, confirmation.insertedId.toString(), playerName)
        })
    }
    function makeNewSinglePlayerGame(req, res) {
        let game = Game()
        game.singlePlayer = true;
        game.init()

        database.insertNewGame(game).then((confirmation)=>{
            if(confirmation && confirmation.insertedId)
            {
                logger.info(confirmation.insertedId)
            }
            else logger.info("Confirmation was undefined")
            redirectToNewSinglePlayerGamePage(res, confirmation.insertedId.toString())
        })
    }
    function redirectToNewGamePage(res, gameId, playerName){
        if(res && res.redirect)
        {
            res.redirect("../game.html?gameId="+gameId+"&name="+playerName)
        }
    }
    function redirectToNewSinglePlayerGamePage(res, gameId){
        if(res && res.redirect)
        {
            res.redirect("../game.html?gameId="+gameId+"&singlePlayer=true")
        }
    }
    http.listen(3000, 'backend', function () {
        console.log('listening on *:3000');
        logger.info('listening on *:3000');
    });
}

let backend = new BackendServer();

