"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeckEmptyError = void 0;

var _BriscolaError = require("./BriscolaError.js");

class DeckEmptyError extends _BriscolaError.BriscolaError {
  constructor(message) {
    let messagePrefix = "The deck is empty";
    super(messagePrefix + message);
    this.name = "DeckEmptyError";
  }

}

exports.DeckEmptyError = DeckEmptyError;