"use strict";
class PileIncompleteError extends Error {
    constructor(message)
    {
        super(message);
        this.name = "PileIncompleteError";
    }
}

class PileFullError extends Error {
    constructor(message)
    {
        super(message);
        this.name = "PileFullError";
    }
}

export { PileIncompleteError,  PileFullError}