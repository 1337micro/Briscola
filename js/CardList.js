"use strict";
import { CardNotInCardListError} from "./errors/CardListErrors";
import {HandDoesNotContainCardError, HandEmptyError} from "./errors/HandErrors";

function CardList()
{
    let state =
    {
        cards: []
    }

    return Object.assign({}, indexer(state), remover(state), adder(state), reseter(state))
}
function indexer(state)
{
    return {
        indexOfCard: function(card)
        {
            for(let i = 0; i<state.cards.length; i++)
            {
                let currentCard = state.cards[i];
                if(currentCard.suit === card.suit && currentCard.rank === card.rank)
                {
                    return i;
                }
            }
            throw new CardNotInCardListError()
        }
    }
}
function remover(state)
{
    return {
        removeCard: function(card)
        {
            if(state.cards.length === 0)
            {
                throw new HandEmptyError();
            }
            else
            {
                let indexOfCardInHand = state.indexOfCard.call(state, card);
                if(indexOfCardInHand === -1)
                {
                    throw new HandDoesNotContainCardError();
                }
                else
                {
                    state.cards.splice(indexOfCardInHand, 1);
                }
            }
        }
    }

}
function adder(state)
{
    return{
        addCard:function(card)
        {
            state.cards.push(card)
        },
        addCards:function(cards)
        {
            cards.forEach((card)=>{
                state.addCard(card)
            })
        }
    }
}
function reseter(state)
{
    return{
        reset: function()
        {
            state.cards.clear()
        }
    }
}

export { CardList };