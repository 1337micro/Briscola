import { Card } from './Card.js'
import { suits } from './Suits.js'
import {CardList} from "./CardList";
import {DeckEmptyError} from "./errors/DeckErrors";
function Deck(deckState = {}) {
    let state = {
        cards: deckState.cards
    };
    return Object.assign(state, CardList(state), generator(state), shuffler(state), drawer(state), drawerForTrumpCard(state))
}
    function generator(state)
    {
        return {
            generateDeck: function()
            {
                let enumSuits = suits();
                for(let i = 1; i<=10; i++)
                {
                    Object.keys(enumSuits).forEach(suit => {
                        const card = Card({rank:i, suit:enumSuits[suit]})
                        state.cards.push(card)
                    })
                }
            }
        }
    }


function shuffler(state)
{
  return {
      /**
       * Shuffles array in place.
       * @param {Array} a items An array containing the items.
       */
      shuffle: function() {
          var j, x, i;
          for (i = state.cards.length - 1; i > 0; i--) {
              j = Math.floor(Math.random() * (i + 1));
              x = state.cards[i];
              state.cards[i] = state.cards[j];
              state.cards[j] = x;
          }
      }
  }
}

function drawer(state)
{
    return {
        drawCard: function()
        {
            if(state.cards.length === 0)
            {
                throw new DeckEmptyError();
            }
            else
            {
                return state.cards.pop();
            }
        }
    }
}
function drawerForTrumpCard(state)
{
    return{
        drawTrumpCard: function()
        {
            let card = state.drawCard()
            state.cards.unshift(card)//add trump card back to the end of the deck
            return card
        }
    }
}
export { Deck }
