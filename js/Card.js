"use strict";
class Card {
  constructor(cardState = {}) {
    this.rank = cardState.rank,
    this.points = cardState.points,
    this.suit = cardState.suit
  }
  equals(otherCard){
      return this.rank === otherCard.rank && this.suit === otherCard.suit;
  }
}

export { Card }