import { Deck } from './Deck.js'
import { Hand } from './Hand.js'
import { Player } from './Player.js'
import { Constants } from './Constants.js'
function Game()
{
    this.gameState = Constants.gameStates.NORMAL_ROUND;
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
    this.playerForClientSide;

    this.drawTrumpCard = function (){
        let card = this.drawCard()
        this.deck.cards.unshift(card)//add trump card back to the end of the deck
        return card;
    }
    this.trumpCard = this.drawTrumpCard()


    this.firstPlayerToActByIndex = 0
    this.currentPlayerToActByIndex = 0
    this.playerIndexForClientSide;

    this.canPlayerAct = function(player){
        return this.playerToAct === player;
    }
    this.next = function()
    {

    }

    this.decideWinner = function(firstCard, secondCard)
    {
        let listOfStrengthsByRank = [1, 3, 10, 9, 8, 7, 6,5,4,3,2]//decreasing
        if(firstCard.suit !== secondCard.suit)
        {
            return firstCard;
        }
        else if(listOfStrengthsByRank.indexOf(firstCard.rank) < listOfStrengthsByRank.indexOf(secondCard.rank))
        {
            return firstCard
        }
        else {
            return secondCard;
        }
    }


}
export { Game }