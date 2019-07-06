"use strict";
const express = require('express')
const expressApp = express();

const http = require('http').createServer(expressApp);

const io = require('socket.io')(http);

var path = require('path');




import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
function BackendServer() {

    expressApp.get('/', function (req, res) {

    });
    io.on('connection', function (socket) {
        console.log('a user connected');
    });
    http.listen(3000, function () {
        console.log('listening on *:3000');
    });
}

let backend = new BackendServer();

