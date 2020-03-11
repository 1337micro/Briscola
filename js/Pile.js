"use strict";
import { CardList } from "./CardList";
/**
 * A super-class middlePile. Represents the cards won by some player. For the middlePile of cards in the middle, see MiddlePile.js
 * @param cards an array of card objects
 * @constructor
 */
function Pile(cards = [])
{
    CardList.call(this, cards);
}
Pile.prototype.addCard = function(card)
{
    this.cards.push(card)
}
Pile.prototype.addCards = function(cards)
{
    cards.forEach((card)=>{
        this.addCard(card)
    })
}
Pile.prototype.reset = function()
{
    if(!this.isPileComplete())
    {
        console.error("Warning: clearing an incomplete middlePile of cards")
    }
    this.cards.clear()
}
export { Pile }