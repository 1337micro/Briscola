import {HandEmptyError, HandFullError, HandDoesNotContainCardError} from "./errors/HandErrors";
import { Constants } from './Constants.js'
import {CardList} from "./CardList";

function Hand(cards = [])
{
  CardList.call(this, cards)
}
Hand.prototype.removeCard = function(card)
{
  if(this.cards.length === 0)
  {
    throw new HandEmptyError();
  }
  else
  {
      let indexOfCardInHand = CardList.prototype.indexOfCard.call(this, card);
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
Hand.prototype.addCard = function(card)
{
    if(this.cards.length === Constants.gameConstants.MAX_NUMBER_CARDS_IN_HAND)
    {
        throw new HandFullError();
    }
    else
    {
        this.cards.push(card)
    }
}
export { Hand }
