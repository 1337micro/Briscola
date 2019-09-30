"use strict";
const express = require('express')
const expressApp = express();
import { Constants } from './Constants.js'

const http = require('http').createServer(expressApp);

const io = require('socket.io')(http);

var path = require('path');

import { Game } from "./Game.js"


const listOfSockets = [];
const game = new Game()
function BackendServer() {
    expressApp.use(express.static(__dirname))
    expressApp.get('/', function (req, res) {

    });
    io.on('connection', function (socket) {
        console.log('a user connected', socket.id);
        if(listOfSockets.length % 2 === 0)
        {
            listOfSockets.push(socket);
            let player1Socket = socket
            game.playerIndex = 0;
            player1Socket.emit(Constants.events.GAME_START, game);
            //player1Socket.emit(Constants.events.TRUMP_CARD, game.trumpCard);
        }
        else if(listOfSockets.length % 2 !== 0)
        {
            //len 1
            listOfSockets.push(socket)
            let player2Socket = socket
            game.playerIndex = 1;
            player2Socket.emit(Constants.events.GAME_START, game);
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

