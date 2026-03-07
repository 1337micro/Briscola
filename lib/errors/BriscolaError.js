"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BriscolaError = void 0;

class BriscolaError extends Error {
  constructor(message, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BriscolaError);
    }

    this.name = " BriscolaError";
  }

}

exports.BriscolaError = BriscolaError;