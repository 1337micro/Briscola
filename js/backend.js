"use strict";
const express = require('express')
const expressApp = express();
import { Constants } from './Constants.js'

const http = require('http').createServer(expressApp);

const io = require('socket.io')(http);

var path = require('path');

import { Game } from "./Game.js"



const game = new Game()
function BackendServer() {
    expressApp.use(express.static(__dirname))
    expressApp.get('/', function (req, res) {
        console.log('a user requested the page');
    });
    expressApp.get('/game', function (req, res) {
        console.log('a requested the game');
    });
    io.on('connection', function (socket) {
        console.log('a user connected', socket.id);
        if(game.players[0].socketId == undefined)
        {
            game.players[0].socketId = socket.id;
            game.playerIndexForClientSide = 0;
            socket.emit(Constants.events.GAME_START, game);

        }
        else if(game.players[1].socketId == undefined)
        {
            //len 1
            game.players[1].socketId = socket.id;
            game.playerIndexForClientSide = 1;
            socket.emit(Constants.events.GAME_START, game);
            //player2Socket.emit(Constants.events.TRUMP_CARD, game.trumpCard);

        }

        socket.on(Constants.events.CARD_PLAYED, function(cardPlayed)
        {
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

