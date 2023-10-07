"use strict";
import {Pile} from "./Pile.js";
import {Hand} from "./Hand.js";

class Player {
    constructor(playerState = {}) {
        this.hand = new Hand(playerState.hand)
        this.socketId = playerState.socketId
        this.pile = new Pile(playerState.pile)
        this.name = playerState.name
    }

    hasCard(card){
        return this.hand.cardIsInHand(card);
    }
}

export {Player}
