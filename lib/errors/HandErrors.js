"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HandDoesNotContainCardError = exports.HandFullError = exports.HandEmptyError = void 0;

var _BriscolaError = require("./BriscolaError.js");

class HandFullError extends _BriscolaError.BriscolaError {
  constructor(message = "This player's hand is full, cannot add new cards") {
    super(message);
    this.name = "HandFullError";
  }

}

exports.HandFullError = HandFullError;

class HandEmptyError extends _BriscolaError.BriscolaError {
  constructor(message = "This player's hand is empty, cannot remove new cards") {
    super(message);
    this.name = "HandEmptyError";
  }

}

exports.HandEmptyError = HandEmptyError;

class HandDoesNotContainCardError extends _BriscolaError.BriscolaError {
  constructor(message = "This player's hand does not contain this card") {
    super(message);
    this.name = "HandDoesNotContainCardError";
  }

}

exports.HandDoesNotContainCardError = HandDoesNotContainCardError;