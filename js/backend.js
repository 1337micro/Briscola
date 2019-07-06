"use strict";
const express = require('express')
const expressApp = express();

const http = require('http').createServer(expressApp);

const io = require('socket.io')(http);

var path = require('path');

import { Game } from "./Game.js"
function BackendServer() {
    expressApp.use(express.static(__dirname))
    expressApp.get('/', function (req, res) {
        res.send('<html><head><body><script src="./socket.io.js"></script>\n' +
            '<script>\n' +
            '  var socket = io();\n' +
            '</script></body></head></html>')
    });
    io.on('connection', function (socket) {
        console.log('a user connected');
    });
    http.listen(3000, function () {
        console.log('listening on *:3000');
    });
}

let backend = new BackendServer();

