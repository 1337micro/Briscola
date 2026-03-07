"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Hand = void 0;

var _HandErrors = require("./errors/HandErrors.js");

var _Constants = require("./Constants.js");

var _CardList = require("./CardList.js");

class Hand extends _CardList.CardList {
  constructor(handState = {}) {
    super(handState);
    this.gameType = handState.gameType;
  }

  getMaxCards() {
    return this.gameType === _Constants.Constants.gameConstants.BRSICOLA_500 ? _Constants.Constants.gameConstants.MAX_NUMBER_CARDS_IN_HAND_BRISCOLA_500 : _Constants.Constants.gameConstants.MAX_NUMBER_CARDS_IN_HAND;
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
    if (this.cards.length === this.getMaxCards()) {
      throw new _HandErrors.HandFullError();
    } else {
      super.addCard(card);
    }
  } //overwrites addCards from CardList because we need custom logic for the hand to check if hand is full


  addCards(cards) {
    if (this.cards.length + cards.length > this.getMaxCards()) {
      throw new _HandErrors.HandFullError();
    } else {
      super.addCards(cards);
    }
  }

  containsCard(card) {
    return this.cards.some(cardInHand => {
      return cardInHand.equals(card);
    });
  }

  checkIfHandContainsHorseAndKingOf(suit) {
    return this.containsCard({
      rank: 9,
      suit: suit
    }) && this.containsCard({
      rank: 10,
      suit: suit
    });
  }

}

exports.Hand = Hand;