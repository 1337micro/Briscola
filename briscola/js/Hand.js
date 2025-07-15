import {HandFullError} from "./errors/HandErrors.js";
import {Constants} from './Constants.js'
import {CardList} from "./CardList.js";

class Hand extends CardList {
    constructor(gameVariantOrHandState = Constants.gameVariants.TRADITIONAL, handState = {}) {
        // Handle backward compatibility: if first parameter is an object, it's the old handState parameter
        if (typeof gameVariantOrHandState === 'object' && gameVariantOrHandState !== null) {
            super(gameVariantOrHandState)
            this.gameVariant = Constants.gameVariants.TRADITIONAL
            this.maxCards = Constants.gameConstants.VARIANT_CONFIG[this.gameVariant].CARDS_PER_HAND
        } else {
            // New signature: gameVariant as first parameter
            super(handState)
            this.gameVariant = gameVariantOrHandState
            this.maxCards = Constants.gameConstants.VARIANT_CONFIG[this.gameVariant].CARDS_PER_HAND
        }
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
        if (this.cards.length === this.maxCards) {
            throw new HandFullError();
        } else {
            super.addCard(card)
        }
    }

    //overwrites addCards from CardList because we need custom logic for the hand to check if hand is full
    addCards(cards) {
        if (this.cards.length + cards.length > this.maxCards) {
            throw new HandFullError();
        } else {
            super.addCards(cards)
        }
    }
}


export {Hand}
