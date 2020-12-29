"use strict";
import {Pile} from "./Pile.js";
import {Hand} from "./Hand.js";

function Player(playerState = {})
{
  let state = Object.assign({
    hand: Hand(playerState.hand),
    socketId: playerState.socketId,
    pile: Pile(playerState.pile)
  })
  return Object.assign(state)
}

export { Player }
