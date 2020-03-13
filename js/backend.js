"use strict";
import {Hand} from "./Hand";

var cloneDeep = require('lodash.clonedeep');
const database = require('./database.js')
const express = require('express')
const expressApp = express();
import { Constants } from './Constants.js'

const http = require('http').createServer(expressApp);

const io = require('socket.io')(http);



import { Game } from "./Game.js"
import {MiddlePile} from "./MiddlePile";

var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

// Use express-session middleware for express
expressApp.use(session);


// Use shared session middleware for socket.io
// setting autoSave:true
io.use(sharedsession(session, {
    autoSave:true
}));

let game = Game()
game.init()
function BackendServer() {
    expressApp.use(express.static(__dirname))
    database.insertNewGame(game)//automaticall assigns game._id
    io.on('connection', function (socket) {
        console.log('a user connected', socket.id);
        let session = socket.handshake.session;
        socket.on(Constants.events.REQUEST_GAME_START, function(){
            let playerIndex;
            if (game.players[0].socketId == undefined) {
                playerIndex = 0;
            }
            else if (game.players[1].socketId == undefined) {
                //len 1
                playerIndex = 1;
            }
            session.playerIndex = playerIndex
            session.gameId = game._id

            game.players[playerIndex].socketId = socket.id;
            game.playerForClientSide = game.players[playerIndex]
            game = cloneDeep(game)

            database.saveGame(game)
            socket.emit(Constants.events.GAME_START, game);

        })
        socket.on(Constants.events.CARD_PLAYED, async function(cardPlayed)
        {
            const gameFromDb = await database.getGame(socket.handshake.session.gameId);
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
                let playerHand = Hand(player.hand);
                playerHand.removeCard(cardPlayed)//remove card from player's hand
                let middlePile = MiddlePile(game.middlePile)
                middlePile.addCard(cardPlayed)//add card to middle pile

                game.next()

                if(game.isRoundOver())
                {
                    let winningPlayer = game.getWinningPlayer()
                    winningPlayer.pile.addCards(game.middlePile.cards)
                    game.middlePile.reset()
                    //todo check if game is over
                    game.dealNextCardToAllPlayers()
                    io.emit(Constants.events.ROUND_OVER, winningPlayer)
                }
                socket.emit(Constants.events.CARD_PLAYED_CONFIRMED)
                io.emit(Constants.events.CARD_PLAYED, cardPlayed)//tell clients that a card was played so that it will get displayed
                io.emit(Constants.events.UPDATE_GAME, game)
                database.saveGame(game)
            }
            else
            {
                socket.emit(Constants.events.CARD_PLAYED_REJECTED)
            }
            console.log(cardPlayed)
        })
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });
    function emitUpdateGame(game)
    {
        game.players.forEach(function (player, index) {
            const deepCopyGame = cloneDeep(game)
            io.to(player.socketId).emit(Constants.events.UPDATE_GAME, deepCopyGame)
        })
    }
    http.listen(3000, function () {
        console.log('listening on *:3000');
    });
}

let backend = new BackendServer();

