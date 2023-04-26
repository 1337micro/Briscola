"use strict"
class BriscolaError extends Error
{
    constructor(message, ...params)
    {
        super(...params)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BriscolaError)
        }
        this.name = " BriscolaError"
    }
}
export { BriscolaError };