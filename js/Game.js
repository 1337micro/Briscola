import { Deck } from './Deck.js'
import { Hand } from './Hand.js'
import { Player } from './Player.js'
import { MiddlePile } from './MiddlePile.js'
import { Constants } from './Constants.js'
function Game()
{
    let state = {
        middlePile: MiddlePile(),
        deck: Deck()
    }
    let game = Object.assign({},
        gameLogicController(state)
    )
    return game;
    //stored in session state.playerIndexForClientSide;//set in backend before sending off the first game object
}

function gameLogicController(state)
{
    return{
        init: function()
        {
            state.deck.generateDeck();
            state.deck.shuffle();
            const hand1 = Hand({cards:[state.deck.drawCard(), state.deck.drawCard(), state.deck.drawCard()]})
            const hand2 = Hand({cards:[state.deck.drawCard(), state.deck.drawCard(), state.deck.drawCard()]})
            state.player1 = Player({hand:hand1})
            state.player2 = Player({hand:hand2})
            state.players = [state.player1, state.player2]
            state.trumpCard = state.deck.drawTrumpCard()

            state.firstPlayerToActByIndex = 0
            state.currentPlayerToActByIndex = state.firstPlayerToActByIndex
            state.playerForClientSide;
        },
        next: function()
        {
            if(!state.isRoundOver())
            {
                state.currentPlayerToActByIndex++;
            }
        },
        isRoundOver: function()
        {
            return state.middlePile.isPileComplete();
        },
        getWinningPlayerIndex : function()
        {
            return state.middlePile.decideWinningCardIndex()
        },
        getWinningPlayer : function()
        {
            return state.players[state.middlePile.decideWinningCardIndex()]
        },
        autoSetNextToAct : function()
        {
            state.currentPlayerToActByIndex = state.getWinningPlayerIndex()
        },
        dealNextCardToAllPlayers : function()
        {
            state.players.forEach((player)=>
            {
                let nextCard = state.deck.drawCard()
                player.hand.addCard(nextCard)
            })
        }
    }
}


export { Game }