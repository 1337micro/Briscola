"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Card = void 0;

class Card {
  constructor(cardState = {}) {
    this.rank = cardState.rank, this.points = cardState.points, this.suit = cardState.suit;
  }

  equals(otherCard) {
    return this.rank === otherCard.rank && this.suit === otherCard.suit;
  }

}

exports.Card = Card;