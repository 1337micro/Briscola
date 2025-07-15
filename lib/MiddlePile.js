"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MiddlePile = void 0;

var _PileErrors = require("./errors/PileErrors.js");

var _Constants = require("./Constants.js");

var _CardList = require("./CardList.js");

/**
 * Represents the middlePile of Cards in the middle
 * @param cards An array of Card objects. ORDER MATTERS! The first card should be the first one that was played
 * @constructor
 */
class MiddlePile extends _CardList.CardList {
  constructor(middlePileState = {}) {
    super(middlePileState);
    this.trumpCard = middlePileState.trumpCard;
    this.trumpSuit = middlePileState.trumpSuit; // For Briscola 500 declared trump
  }

  reset() {
    if (!this.isPileComplete()) {
      console.error("Warning, reseting incomplete middle pile");
    }

    super.reset();
  }

  isPileComplete() {
    return this.cards.length === _Constants.Constants.gameConstants.NUMBER_OF_PLAYERS;
  }

  addCard(card) {
    if (this.isPileComplete()) {
      throw new _PileErrors.MiddlePileFullError();
    } else {
      super.addCard(card);
    }
  }

  decideWinningCard() {
    if (!this.isPileComplete()) {
      throw new _PileErrors.MiddlePileIncompleteError();
    } else {
      let winningCard = this.cards[0]; // Get trump suit - either from trump card or declared trump

      const trumpSuit = this.trumpCard ? this.trumpCard.suit : this.trumpSuit;

      for (let i = 1; i < this.cards.length; i++) {
        let otherCard = this.cards[i]; //the winning card is a trump suit

        if (trumpSuit && winningCard.suit === trumpSuit) {
          //the other card is also trump suit
          if (otherCard.suit === trumpSuit) {
            //the other card is also a trump suit
            if (_Constants.Constants.gameConstants.LIST_OF_STRENGTHS_BY_RANK.indexOf(otherCard.rank) < _Constants.Constants.gameConstants.LIST_OF_STRENGTHS_BY_RANK.indexOf(winningCard.rank)) {
              //the other card is a stronger trump suit
              winningCard = otherCard;
            } //the other card is not a trump suit
            //do nothing

          }
        } //the other card is a trump suit
        else if (trumpSuit && otherCard.suit === trumpSuit) {
            //but the winning card isn't,
            winningCard = otherCard;
          } else {
            //no trump suits
            if (winningCard.suit === otherCard.suit && _Constants.Constants.gameConstants.LIST_OF_STRENGTHS_BY_RANK.indexOf(otherCard.rank) < _Constants.Constants.gameConstants.LIST_OF_STRENGTHS_BY_RANK.indexOf(winningCard.rank)) {
              winningCard = otherCard;
            }
          }
      }

      return winningCard;
    }
  }

  decideWinningCardIndex() {
    return this.indexOfCard(this.decideWinningCard());
  }

}

exports.MiddlePile = MiddlePile;