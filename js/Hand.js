import {HandEmptyError, HandFullError, HandDoesNotContainCardError} from "./errors/HandErrors";
import { Constants } from './Constants.js'
import {CardList} from "./CardList";

function Hand(handState = {})
{
    let state={
        cards: handState.cards || []
    }
  return Object.assign(state, CardList(state), handAdder(state))
}
function equals(state)
{
    return {
        equals: function(otherHand)
        {
            return state.cards.length === otherHand.cards.length && //lenth of hands are the same
                state.cards.every(cardInHand => { //for every card in this hand
                    return otherHand.cards.some(cardInOtherHand=>{//there is at least one card
                        return cardInHand.equals(cardInOtherHand)//that is equal to the card in this hand
                    })
                })
        }
    }
}
function handAdder(state)
{
    return{
        //overwrites addCard from CardList because we need custom logic for the hand to check if hand is full
        addCard: function(card)
        {
            if(state.cards.length === Constants.gameConstants.MAX_NUMBER_CARDS_IN_HAND)
            {
                throw new HandFullError();
            }
            else
            {
                state.cards.push(card)
            }
        }
    }
}

export { Hand }
