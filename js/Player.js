"use strict";
import {Pile} from "./Pile";

function Player(hand, socketId)
{
  this.hand = hand;
  this.socketId = socketId;

  this.pile = new Pile();
}

export { Player }
