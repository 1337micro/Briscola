"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Hand = void 0;

var _HandErrors = require("./errors/HandErrors.js");

var _Constants = require("./Constants.js");

var _CardList = require("./CardList.js");

class Hand extends _CardList.CardList {
  constructor(gameVariantOrHandState = _Constants.Constants.gameVariants.TRADITIONAL, handState = {}) {
    // Handle backward compatibility: if first parameter is an object, it's the old handState parameter
    if (typeof gameVariantOrHandState === 'object' && gameVariantOrHandState !== null) {
      super(gameVariantOrHandState);
      this.gameVariant = _Constants.Constants.gameVariants.TRADITIONAL;
      this.maxCards = _Constants.Constants.gameConstants.VARIANT_CONFIG[this.gameVariant].CARDS_PER_HAND;
    } else {
      // New signature: gameVariant as first parameter
      super(handState);
      this.gameVariant = gameVariantOrHandState;
      this.maxCards = _Constants.Constants.gameConstants.VARIANT_CONFIG[this.gameVariant].CARDS_PER_HAND;
    }
  }

  equals(otherHand) {
    return this.cards.length === otherHand.cards.length && //length of hands are the same
    this.cards.every(cardInHand => {
      //for every card in this hand
      return otherHand.cards.some(cardInOtherHand => {
        //there is at least one card
        return cardInHand.equals(cardInOtherHand); //that is equal to the card in this hand
      });
    });
  } //overwrites addCard from CardList because we need custom logic for the hand to check if hand is full


  addCard(card) {
    if (this.cards.length === this.maxCards) {
      throw new _HandErrors.HandFullError();
    } else {
      super.addCard(card);
    }
  } //overwrites addCards from CardList because we need custom logic for the hand to check if hand is full


  addCards(cards) {
    if (this.cards.length + cards.length > this.maxCards) {
      throw new _HandErrors.HandFullError();
    } else {
      super.addCards(cards);
    }
  }

}

exports.Hand = Hand;