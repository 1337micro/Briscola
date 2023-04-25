"use strict";

import { Game } from "../../js/Game.js";
const database = require("../../js/database");

(async function(){
while(true)
{
    let game = new Game()
    game.init()
    while(!game.isGameOver())
    {
        game._playRound()
    }
    await database.insertNewGameString({game: game.history})
}
})()
