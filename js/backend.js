"use strict";
var path = require('path');
var cloneDeep = require('lodash.clonedeep');
const express = require('express')
const expressApp = express();
import { Constants } from './Constants.js'

const http = require('http').createServer(expressApp);

const io = require('socket.io')(http);



import { Game } from "./Game.js"

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

let game = new Game()
function BackendServer() {
    expressApp.use(express.static(__dirname))

    io.on('connection', function (socket) {
        console.log('a user connected', socket.id);
        let session = socket.handshake.session;
        socket.on(Constants.events.REQUEST_GAME_START, function(){
            if (socket.handshake.session.game != undefined) {
                //return existing game
                socket.emit(Constants.events.GAME_START, socket.handshake.session.game);
            }
            else {
                if (game.players[0].socketId == undefined) {

                    game.playerIndexForClientSide = 0;
                    game.currentPlayerToActByIndex = 0;
                    game.players[0].socketId = socket.id;
                    socket.handshake.session.game = cloneDeep(game);
                }
                else if (game.players[1].socketId == undefined) {
                    //len 1
                    game.playerIndexForClientSide = 1;
                    game.currentPlayerToActByIndex = 0;
                    game.players[1].socketId = socket.id;
                    socket.handshake.session.game = cloneDeep(game);

                }
                socket.handshake.session.save()
                socket.emit(Constants.events.GAME_START, socket.handshake.session.game);
            }
        })
        socket.on(Constants.events.CARD_PLAYED, function(cardPlayed)
        {
            if(socket.handshake.session.game == undefined)
            {
                console.error("Undefined game?")
            }
            if(socket.handshake.session.game.currentPlayerToActByIndex === socket.handshake.session.game.playerIndexForClientSide)
            {
                //player is allowed to act (backend check)
                socket.handshake.session.game.pile.addCard(cardPlayed)
                socket.handshake.session.game.next()

                if(socket.handshake.session.game.isRoundOver())
                {

                }
                io.emit(Constants.events.CARD_PLAYED, cardPlayed)
                io.emit(Constants.events.UPDATE_GAME, socket.handshake.session.game)
            }
            console.log(cardPlayed)
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

