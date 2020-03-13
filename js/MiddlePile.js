"use strict";
import {MiddlePileIncompleteError , MiddlePileFullError} from './errors/PileErrors.js'
import { Constants } from './Constants.js'
import { Pile } from './Pile.js'
import {CardList} from "./CardList";
/**
 * Represents the middlePile of Cards in the middle
 * @param cards An array of Card objects. ORDER MATTERS! The first card should be the first one that was played
 * @constructor
 */
function MiddlePile(cards =[])
{
    let state={
        cards: cards
    }
    return Object.assign({}, Pile(state), middlePileReseter(state), middlePileFullChecker(state),
        middlePileAdder(state),winnerDecider(state))
}
function middlePileReseter(state)
{
    return {
        reset: function()
        {
            if(!this.isPileComplete())
            {
                console.error("Warning, reseting incomplete middle pile")
            }            
            state.cards.reset()
        }
    }
}
function middlePileFullChecker(state)
{
    return{
        isPileComplete: function()
        {
            return state.cards.length === Constants.gameConstants.NUMBER_OF_PLAYERS;
        }
    }
}
function middlePileAdder(state)
{
    return {
        addCard: function(card)
        {
            if(this.isPileComplete())
            {
                throw new MiddlePileFullError();
            }
            else
            {
                state.cards.push(card)
            }
        }
    }
}
function winnerDecider(state)
{
    return {
        decideWinningCard: function()
        {
            if(!this.isPileComplete())
            {
                throw new MiddlePileIncompleteError()
            }
            else
            {
                let winningCard = state.cards[0]


                for(let i = 1; i<state.cards.length; i++)
                {
                    let otherCard = state.cards[i]

                    if(winningCard.suit === otherCard.suit &&
                        Constants.gameConstants.LIST_OF_STRENGTHS_BY_RANK.indexOf(otherCard.rank) <  Constants.gameConstants.LIST_OF_STRENGTHS_BY_RANK.indexOf(winningCard.rank))
                    {
                        winningCard = otherCard;
                    }
                }

                return winningCard;
            }
        },
        decideWinningCardIndex: function()
        {
            return this.indexOfCard(this.decideWinningCard());
        }
    }
}

export { MiddlePile }