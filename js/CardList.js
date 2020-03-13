"use strict";
import { CardNotInCardListError} from "./errors/CardListErrors";

function CardList(state)
{
    this.cards = cards;
}
CardList.prototype.indexOfCard = function(card)
{
    for(let i = 0; i<this.cards.length; i++)
    {
        let currentCard = this.cards[i];
        if(currentCard.suit === card.suit && currentCard.rank === card.rank)
        {
            return i;
        }
    }
    throw new CardNotInCardListError()
}

export { CardList };