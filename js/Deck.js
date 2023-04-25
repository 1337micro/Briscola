import {Card} from './Card.js'
import {suits} from './Suits.js'
import {CardList} from "./CardList.js";
import {DeckEmptyError} from "./errors/DeckErrors.js";
import {Constants} from "./Constants";

class Deck extends CardList {
    constructor(deckState = {}) {
        super(deckState)
    }

    generateDeck() {
        let enumSuits = suits();
        for (let i = 1; i <= 10; i++) {
            Object.keys(enumSuits).forEach(suit => {
                const rank = i;
                const card = new Card({
                    rank: rank,
                    suit: enumSuits[suit],
                    points: Constants.gameConstants.MAP_RANK_TO_NUMBER_OF_POINTS[rank]
                })
                this.cards.push(card)
            })
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
            throw new DeckEmptyError();
        } else {
            return this.cards.pop();
        }
    }

    drawTrumpCard() {
        let card = this.drawCard()
        this.cards.unshift(card)//add trump card back to the end of the deck
        return card
    }


}

export {Deck}
