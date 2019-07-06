"use strict";

import express from 'express';
let expressApp = express();
import httpNode from 'http'
let http =  httpNode.createServer(expressApp);
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


import Game from './game.js'

function GameServer() {
    expressApp.use(express.static(__dirname))
    expressApp.get('/', function (req, res) {
        const parentDir = __dirname.substring(0, __dirname.lastIndexOf(path.sep));

        console.log(parentDir + path.sep + 'index.html');
        res.sendFile(parentDir + path.sep + 'index.html');
    });

    http.listen(80, function () {
        console.log('listening on *:80');
    });
}

let gameServer = new GameServer();

