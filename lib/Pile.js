"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pile = void 0;

var _CardList = require("./CardList.js");

var _Constants = require("./Constants.js");

/**
 * A super-class pile. Represents the cards won by some player. For the middlePile of cards in the middle, see MiddlePile.js
 * @param cards an array of card objects
 * @constructor
 */
class Pile extends _CardList.CardList {
  constructor(pileState = {}) {
    super(pileState);
  }

  countPoints() {
    if (this.cards) {
      return this.cards.reduce((sumOfPoints, card) => {
        let numPointsForThisCard = _Constants.Constants.gameConstants.MAP_RANK_TO_NUMBER_OF_POINTS[card.rank];

        if (numPointsForThisCard && numPointsForThisCard > 0) {
          return sumOfPoints + numPointsForThisCard;
        } else return sumOfPoints;
      }, 0);
    } else {
      return 0;
    }
  }

}

exports.Pile = Pile;