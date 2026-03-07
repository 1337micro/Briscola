"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CardList = void 0;

var _Card = require("./Card.js");

var _CardListErrors = require("./errors/CardListErrors.js");

var _HandErrors = require("./errors/HandErrors.js");

class CardList {
  constructor(cardState = {}) {
    if (cardState.cards) {
      cardState.cards = cardState.cards.map(card => {
        return new _Card.Card({
          rank: card.rank,
          suit: card.suit,
          points: card.points
        });
      });
    }

    this.cards = cardState.cards || [];
  }

  indexOfCard(card) {
    for (let i = 0; i < this.cards.length; i++) {
      let currentCard = this.cards[i];

      if (currentCard.suit === card.suit && currentCard.rank === card.rank) {
        return i;
      }
    }

    throw new _CardListErrors.CardNotInCardListError();
  }

  removeCard(card) {
    if (this.cards.length === 0) {
      throw new _HandErrors.HandEmptyError();
    } else {
      let indexOfCardInHand = this.indexOfCard.call(this, card);

      if (indexOfCardInHand === -1) {
        throw new _HandErrors.HandDoesNotContainCardError();
      } else {
        this.cards.splice(indexOfCardInHand, 1);
      }
    }
  }

  addCard(card) {
    this.cards.push(card);
  }

  addCards(cards) {
    cards.forEach(card => {
      this.addCard(card);
    });
  }

  reset() {
    this.cards = [];
  }

}

exports.CardList = CardList;