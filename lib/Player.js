"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Player = void 0;

var _Pile = require("./Pile.js");

var _Hand = require("./Hand.js");

class Player {
  constructor(playerState = {}) {
    this.hand = new _Hand.Hand(playerState.hand);
    this.socketId = playerState.socketId;
    this.pile = new _Pile.Pile(playerState.pile);
    this.name = playerState.name;
  }

}

exports.Player = Player;