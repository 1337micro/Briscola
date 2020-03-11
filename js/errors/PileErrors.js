"use strict";
import {BriscolaError} from "./BriscolaError";

class MiddlePileIncompleteError extends BriscolaError {
    constructor(message = "MiddlePile is not complete.There is at least 1 player that has not played their card yet. " +
    "The number of cards in the middlePile should be equal to the number of players before deciding who the winner is ")
    {
        super(message);
        this.name = "MiddlePileIncompleteError";
    }
}

class MiddlePileFullError extends BriscolaError {
    constructor(message="MiddlePile is full. Cannot have more cards than there are players in the game. Did you call middlePile.reset()?")
    {
        super(message);
        this.name = "MiddlePileFullError";
    }
}

export { MiddlePileIncompleteError,  MiddlePileFullError}