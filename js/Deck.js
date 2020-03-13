import { Card } from './Card.js'
import { suits } from './Suits.js'
import {CardList} from "./CardList";
import {DeckEmptyError} from "./errors/DeckErrors";
function Deck(cards = [])
{
  CardList.call(this, cards);
  this.generateDeck = function()
  {
    let enumSuits = suits();
    for(let i = 1; i<=10; i++)
    {
      Object.keys(enumSuits).forEach(suit => {
        const card = new Card(i, enumSuits[suit])
         this.cards.push(card)
      })
    }
  }
  /**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
  this.shuffle = function() {
    var j, x, i;
    for (i = this.cards.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = this.cards[i];
        this.cards[i] = this.cards[j];
        this.cards[j] = x;
    }
}

}
Deck.prototype.copy = function(deck)
{

}
Deck.prototype.drawCard = function()
{
    if(this.cards.length === 0)
    {
        throw new DeckEmptyError();
    }
    else
    {
        return this.cards.pop();
    }
}
export { Deck }
