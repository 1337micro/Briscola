"use strict";
import { CardList } from "./CardList";
import { Constants } from "./Constants";

/**
 * A super-class pile. Represents the cards won by some player. For the middlePile of cards in the middle, see MiddlePile.js
 * @param cards an array of card objects
 * @constructor
 */
function Pile(pileState = {})
{
    let state = {
        cards:pileState.cards
    }
    return Object.assign(state, CardList(state), pointCounter(state))
}
function pointCounter(state)
{
    return {
        countPoints: function()
        {
            if(state.cards)
            {
                return state.cards.reduce((sumOfPoints, card)=>{
                    let numPointsForThisCard = Constants.gameConstants.MAP_RANK_TO_NUMBER_OF_POINTS[card.rank]
                    if(numPointsForThisCard && numPointsForThisCard>0)
                    {
                        return sumOfPoints + numPointsForThisCard
                    }
                    else return sumOfPoints;
                }, 0)
            }
            else {
                return 0;
            }
        }
    }
}
export { Pile }