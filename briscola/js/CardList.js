"use strict";
import {Card} from './Card.js'
import {CardNotInCardListError} from "./errors/CardListErrors.js";
import {HandDoesNotContainCardError, HandEmptyError} from "./errors/HandErrors.js";

class CardList {
    constructor(cardState = {}) {
        if (cardState.cards) {
            cardState.cards = cardState.cards.map((card) => {
                return new Card({rank: card.rank, suit: card.suit, points: card.points})
            })
        }

        this.cards = cardState.cards || []
    }

    indexOfCard(card) {
        for (let i = 0; i < this.cards.length; i++) {
            let currentCard = this.cards[i];
            if (currentCard.suit === card.suit && currentCard.rank === card.rank) {
                return i;
            }
        }
        throw new CardNotInCardListError()
    }

    cardIsInHand(card) {
        try{
           this.indexOfCard(card);
        } catch (e) {
            return false
        }
        return true;
    }

    removeCard(card) {
        if (this.cards.length === 0) {
            throw new HandEmptyError();
        } else {
            if (!this.cardIsInHand(card)) {
                throw new HandDoesNotContainCardError();
            } else {
                this.cards.splice(this.indexOfCard(card), 1);
            }
        }
    }

    addCard(card) {
        this.cards.push(card)
    }

    addCards(cards) {
        cards.forEach((card) => {
            this.addCard(card)
        })
    }

    reset() {
        this.cards = []
    }
}


export {CardList};