"use strict";
import {Pile} from "./Pile";
import {Hand} from "./Hand";

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
