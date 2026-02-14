"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CardNotInCardListError = void 0;

var _BriscolaError = require("./BriscolaError.js");

class CardNotInCardListError extends _BriscolaError.BriscolaError {
  constructor(message) {
    let messagePrefix = "The card does not exist in the card list";
    super(messagePrefix + message);
    this.name = "CardNotInCardListError";
  }

}

exports.CardNotInCardListError = CardNotInCardListError;