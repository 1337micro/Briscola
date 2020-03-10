import { Deck } from './Deck.js'
import { Hand } from './Hand.js'
import { Player } from './Player.js'
import { Pile } from './Pile.js'
import { Constants } from './Constants.js'
function Game()
{
    this.gameState = Constants.gameStates.NORMAL_ROUND;
    this.NUMBER_OF_PLAYERS = 2;
    this.pile = new Pile([], this.NUMBER_OF_PLAYERS);
    this.deck = new Deck();
    this.deck.generateDeck();
    this.deck.shuffle();
    this.drawCard = function()
    {
        return this.deck.cards.pop();
    }

    this.player1 = new Player(new Hand(this.drawCard(), this.drawCard(), this.drawCard()))
    this.player2 = new Player(new Hand(this.drawCard(), this.drawCard(), this.drawCard()))
    this.players = [this.player1, this.player2]


    this.drawTrumpCard = function (){
        let card = this.drawCard()
        this.deck.cards.unshift(card)//add trump card back to the end of the deck
        return card;
    }
    this.trumpCard = this.drawTrumpCard()


    this.firstPlayerToActByIndex = 0
    this.currentPlayerToActByIndex = 0
    this.playerIndexForClientSide;

    this.next = function()
    {
        if(!this.isRoundOver())
        {
            this.currentPlayerToActByIndex++;
        }


    }
    this.isRoundOver = function()
    {
        return this.pile.isPileComplete();
    }

}
export { Game }