"use strict";
import {BriscolaError} from "./BriscolaError.js";

class CardNotInCardListError extends BriscolaError
{
    constructor(message)
    {
        let messagePrefix  = "The card does not exist in the card list"
        super(messagePrefix+message);
        this.name = "CardNotInCardListError";
    }
}
export { CardNotInCardListError };