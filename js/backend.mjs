"use strict";

import express from 'express';
let expressApp = express();
import httpNode from 'http'
let http =  httpNode.createServer(expressApp);
import ioNode from 'socket.io';
let io = ioNode(http)
import path from 'path';


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

