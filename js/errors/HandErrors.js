"use strict";
import {BriscolaError} from "./BriscolaError";

class HandFullError extends BriscolaError {
    constructor(message = "This player's hand is full, cannot add new cards")
    {
        super(message);
        this.name = "HandFullError";
    }
}
class HandEmptyError extends BriscolaError {
    constructor(message = "This player's hand is empty, cannot remove new cards")
    {
        super(message);
        this.name = "HandEmptyError";
    }
}
class HandDoesNotContainCardError extends BriscolaError
{
    constructor(message = "This player's hand does not contain this card")
    {
        super(message);
        this.name = "HandDoesNotContainCardError";
    }
}

export { HandEmptyError, HandFullError, HandDoesNotContainCardError };