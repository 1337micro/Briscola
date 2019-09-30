import { Deck } from './Deck.js'
import { Hand } from './Hand.js'
import { Player } from './Player.js'
function Game()
{
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
    this.trumpCard = this.drawCard()
    


}
export { Game }