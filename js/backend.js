"use strict";
import {Hand} from "./Hand";

var cloneDeep = require('lodash.clonedeep');
const database = require('./database.js')
const express = require('express')
const expressApp = express();
import { Constants } from './Constants.js'

const http = require('http').createServer(expressApp);

const Server = require('socket.io')
const io = Server(http, {pingTimeout: 900000});



import { Game } from "./Game.js"
import {MiddlePile} from "./MiddlePile";
import {Player} from "./Player";

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
                game.playerForClientSide = player
                let playerHand = player.hand;
                playerHand.removeCard(cardPlayed)//remove card from player's hand
                let middlePile = game.middlePile
                middlePile.addCard(cardPlayed)//add card to middle pile

                game.next()

                if(game.isRoundOver())
                {
                    let winningPlayer = game.getWinningPlayer()
                    let winningPlayerIndex =  game.getWinningPlayerIndex()
                    game.currentPlayerToActByIndex = winningPlayerIndex
                    winningPlayer.pile.addCards(game.middlePile.cards)
                    game.middlePile.reset()
                    //todo check if game is over
                    game.dealNextCardToAllPlayers()
                    io.emit(Constants.events.ROUND_OVER, winningPlayer)
                }
                
                io.emit(Constants.events.CARD_PLAYED, cardPlayed)//tell clients that a card was played so that it will get displayed
                emitUpdateGame(game)
                database.saveGame(game)
                
            }
            else
            {
                socket.emit(Constants.events.CARD_PLAYED_REJECTED)
                console.log("Card could not be played: ", cardPlayed)
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
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });

    http.listen(3000, function () {
        console.log('listening on *:3000');
    });
}

let backend = new BackendServer();

