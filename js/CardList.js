"use strict";
import {Card} from './Card.js'
import { CardNotInCardListError} from "./errors/CardListErrors.js";
import {HandDoesNotContainCardError, HandEmptyError} from "./errors/HandErrors.js";

class CardList {
    constructor(cardthis = {}) {
        if(cardthis.cards)
        {
            cardthis.cards = cardthis.cards.map((card)=>{
                return Card({rank: card.rank, suit:card.suit, points: card.points})
            })
        }

        this.cards = cardthis.cards || []
    }    

    indexOfCard(card)
    {
            for(let i = 0; i<this.cards.length; i++)
            {
                let currentCard = this.cards[i];
                if(currentCard.suit === card.suit && currentCard.rank === card.rank)
                {
                    return i;
                }
            }
            throw new CardNotInCardListError()
    }

    removeCard(card)
    {
        if(this.cards.length === 0)
        {
            throw new HandEmptyError();
        }
        else
        {
            let indexOfCardInHand = this.indexOfCard.call(this, card);
            if(indexOfCardInHand === -1)
            {
                throw new HandDoesNotContainCardError();
            }
            else
            {
                this.cards.splice(indexOfCardInHand, 1);
            }
        }
    }    

    addCard(card)
    {
        this.cards.push(card)
    }
    addCards(cards)
    {
        cards.forEach((card)=>{
            this.addCard(card)
        })
    }

    reset() {
        this.cards.clear()
    }
}


export { CardList };