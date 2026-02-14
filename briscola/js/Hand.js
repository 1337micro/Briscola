import {HandFullError} from "./errors/HandErrors.js";
import {Constants} from './Constants.js'
import {CardList} from "./CardList.js";

class Hand extends CardList {
    constructor(handState = {}) {
        super(handState)
        this.gameType = handState.gameType;
    }

    getMaxCards() {
        return this.gameType === Constants.gameConstants.BRSICOLA_500 ?
            Constants.gameConstants.MAX_NUMBER_CARDS_IN_HAND_BRISCOLA_500:
            Constants.gameConstants.MAX_NUMBER_CARDS_IN_HAND;
    }

    equals(otherHand) {
        return this.cards.length === otherHand.cards.length && //length of hands are the same
            this.cards.every(cardInHand => { //for every card in this hand
                return otherHand.cards.some(cardInOtherHand => {//there is at least one card
                    return cardInHand.equals(cardInOtherHand)//that is equal to the card in this hand
                })
            })
    }

    //overwrites addCard from CardList because we need custom logic for the hand to check if hand is full
    addCard(card) {
        if (this.cards.length === this.getMaxCards()) {
            throw new HandFullError();
        } else {
            super.addCard(card)
        }
    }

    //overwrites addCards from CardList because we need custom logic for the hand to check if hand is full
    addCards(cards) {
        if (this.cards.length + cards.length > this.getMaxCards()) {
            throw new HandFullError();
        } else {
            super.addCards(cards)
        }
    }
}


export {Hand}
