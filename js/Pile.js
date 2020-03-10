"use strict";
import {PileIncompleteError , PileFullError} from './errors/PileErrors.js'
/**
 * Represents the pile of Cards in the middle
 * @param cards An array of Card objects. ORDER MATTERS! The first card should be the first one that was played
 * @constructor
 */
function Pile(cards = [], NUMBER_OF_PLAYERS = 2)
{
    this.cards = cards;
    this.NUMBER_OF_PLAYERS = NUMBER_OF_PLAYERS;
    this.listOfStrengthsByRank = [1, 3, 10, 9, 8, 7, 6,5,4,3,2]//decreasing
}

/**
 * Return true if the pile has the same number of cards as there are players (meaning every player has played), false otherwise
 * @returns {boolean}
 */
Pile.prototype.isPileComplete = function()
{
    return this.cards.length === this.NUMBER_OF_PLAYERS;
}
Pile.prototype.addCard = function()
{
    if(this.isPileComplete())
    {
        throw new PileFullError("Pile is full. Cannot have more cards than there are players in the game. Did you call pile.reset()?")
    }
    this.cards.push()
}
Pile.prototype.reset = function()
{
    if(!this.isPileComplete())
    {
        console.error("Warning: clearing an incomplete pile of cards")
    }
    this.cards.clear()
}

Pile.prototype.decideWinningCard = function()
{
    if(!this.isPileComplete())
    {
        throw new PileIncompleteError("There is at least 1 player that has not played their card yet. " +
            "The number of cards in the pile should be equal to the number of players before deciding who the winner is")
    }
    else
    {
        let winningCard = this.cards[0]


        for(let i = 1; i<this.cards.length; i++)
        {
            let otherCard = this.cards[i]

            if(winningCard.suit === otherCard.suit &&
                this.listOfStrengthsByRank.indexOf(otherCard.rank) <  this.listOfStrengthsByRank.indexOf(winningCard.rank))
            {
                winningCard = otherCard;
            }
        }

        return winningCard;
    }
}
Pile.prototype.decideWinningCardByIndex = function()
{
    return this.cards.indexOf(this.decideWinningCard());
}

export { Pile }