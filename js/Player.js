"use strict";
import {Pile} from "./Pile.js";
import {Hand} from "./Hand.js";

function Player(playerState = {})
{
  let state = Object.assign({
    hand: new Hand(playerState.hand),
    socketId: playerState.socketId,
    pile: new Pile(playerState.pile),
    name: playerState.name
  })
  return Object.assign(state)
}

export { Player }
