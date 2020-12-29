"use strict";
import {BriscolaError} from "./BriscolaError.js";

class DeckEmptyError extends BriscolaError
{
    constructor(message)
    {
        let messagePrefix  = "The deck is empty"
        super(messagePrefix+message);
        this.name = "DeckEmptyError";
    }
}

export { DeckEmptyError }