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
function MiddlePile(cards = [])
{
    Pile.call(this, cards)
}
MiddlePile.prototype.reset = function()
{
    Pile.prototype.reset.call(this)
}
/**
 * Return true if the middlePile has the same number of cards as there are players (meaning every player has played), false otherwise
 * @returns {boolean}
 */
MiddlePile.prototype.isPileComplete = function()
{
    return this.cards.length === Constants.gameConstants.NUMBER_OF_PLAYERS;
}
MiddlePile.prototype.addCard = function(card)
{
    if(this.isPileComplete())
    {
        throw new MiddlePileFullError();
    }
    else
    {
        Pile.prototype.addCard.call(this, card)
    }
}
MiddlePile.prototype.decideWinningCard = function()
{
    if(!this.isPileComplete())
    {
        throw new MiddlePileIncompleteError()
    }
    else
    {
        let winningCard = this.cards[0]


        for(let i = 1; i<this.cards.length; i++)
        {
            let otherCard = this.cards[i]

            if(winningCard.suit === otherCard.suit &&
                Constants.gameConstants.LIST_OF_STRENGTHS_BY_RANK.indexOf(otherCard.rank) <  Constants.gameConstants.LIST_OF_STRENGTHS_BY_RANK.indexOf(winningCard.rank))
            {
                winningCard = otherCard;
            }
        }

        return winningCard;
    }
}
MiddlePile.prototype.decideWinningCardIndex = function()
{
    return CardList.prototype.indexOfCard.call(this, this.decideWinningCard());
}

export { MiddlePile }