"use strict";
import {Pile} from "./Pile";
import {Hand} from "./Hand";

function Player()
{
  let state = {
    hand: Hand(),
    socketId: undefined,
    pile: Pile()
  }
  return Object.assign({})
}

export { Player }
