import { Deck } from './Deck.js'
import { Hand } from './Hand.js'
import { Player } from './Player.js'
import { MiddlePile } from './MiddlePile.js'
import { Constants } from './Constants.js'
function Game()
{
    this.middlePile = new MiddlePile();
    this.deck = new Deck();
    this.deck.generateDeck();
    this.deck.shuffle();

    this.player1 = new Player(new Hand([this.deck.drawCard(), this.deck.drawCard(), this.deck.drawCard()]))
    this.player2 = new Player(new Hand([this.deck.drawCard(), this.deck.drawCard(), this.deck.drawCard()]))
    this.players = [this.player1, this.player2]
    this.trumpCard = this.drawTrumpCard()

    this.firstPlayerToActByIndex = 0
    this.currentPlayerToActByIndex = this.firstPlayerToActByIndex
    this.playerForClientSide;
    //stored in session this.playerIndexForClientSide;//set in backend before sending off the first game object
}
Game.prototype.drawTrumpCard = function(){
    let card = this.deck.drawCard()
    this.deck.cards.unshift(card)//add trump card back to the end of the deck
    return card
}
Game.prototype.next = function()
{
    if(!this.isRoundOver())
    {
        this.currentPlayerToActByIndex++;
    }
}
Game.prototype.isRoundOver = function()
{
    return this.middlePile.isPileComplete();
}
Game.prototype.getWinningPlayerIndex = function()
{
    return this.middlePile.decideWinningCardIndex()
}
Game.prototype.getWinningPlayer = function()
{
    return this.players[this.middlePile.decideWinningCardIndex()]
}
Game.prototype.autoSetNextToAct = function()
{
    this.currentPlayerToActByIndex = this.getWinningPlayerIndex()
}
Game.prototype.dealNextCardToAllPlayers = function()
{
    this.players.forEach((player)=>
    {
        let nextCard = this.deck.drawCard()
        player.hand.addCard(nextCard)
    })
}
export { Game }