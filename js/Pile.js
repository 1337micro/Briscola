"use strict";
import {CardList} from "./CardList.js";
import {Constants} from "./Constants.js";

/**
 * A super-class pile. Represents the cards won by some player. For the middlePile of cards in the middle, see MiddlePile.js
 * @param cards an array of card objects
 * @constructor
 */
class Pile extends CardList {
    constructor(pileState = {}) {
        super(pileState);
    }

    countPoints() {
        if (this.cards) {
            return this.cards.reduce((sumOfPoints, card) => {
                let numPointsForThisCard = Constants.gameConstants.MAP_RANK_TO_NUMBER_OF_POINTS[card.rank]
                if (numPointsForThisCard && numPointsForThisCard > 0) {
                    return sumOfPoints + numPointsForThisCard
                } else return sumOfPoints;
            }, 0)
        } else {
            return 0;
        }
    }
}

export {Pile}