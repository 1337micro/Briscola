"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Deck = void 0;

var _Card = require("./Card.js");

var _Suits = require("./Suits.js");

var _CardList = require("./CardList.js");

var _DeckErrors = require("./errors/DeckErrors.js");

var _Constants = require("./Constants");

class Deck extends _CardList.CardList {
  constructor(deckState = {}) {
    super(deckState);
  }

  generateDeck() {
    let enumSuits = (0, _Suits.suits)();

    for (let i = 1; i <= 10; i++) {
      Object.keys(enumSuits).forEach(suit => {
        const rank = i;
        const card = new _Card.Card({
          rank: rank,
          suit: enumSuits[suit],
          points: _Constants.Constants.gameConstants.MAP_RANK_TO_NUMBER_OF_POINTS[rank]
        });
        this.cards.push(card);
      });
    }
  }
  /**
   * Shuffles array in place.
   * @param {Array} a items An array containing the items.
   */


  shuffle() {
    var j, x, i;

    for (i = this.cards.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = x;
    }
  }

  drawCard() {
    if (this.cards.length === 0) {
      throw new _DeckErrors.DeckEmptyError();
    } else {
      return this.cards.pop();
    }
  }

  drawTrumpCard() {
    let card = this.drawCard();
    this.cards.unshift(card); //add trump card back to the end of the deck

    return card;
  }

}

exports.Deck = Deck;