import {HandEmptyError, HandFullError, HandDoesNotContainCardError} from "./errors/HandErrors";
import { Constants } from './Constants.js'
import {CardList} from "./CardList";

function Hand(state)
{
    let state=
        {
            cards:CardList()
        }
  return Object.assign({}, handAdder(state))
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
