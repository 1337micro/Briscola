import { Deck } from './Deck.js'
import { Hand } from './Hand.js'
import { Player } from './Player.js'
import { Card } from './Card.js'
import { MiddlePile } from './MiddlePile.js'
import { Constants } from './Constants.js'
function Game(gameState = {})
{
    let state = {}
    state._id = gameState._id //game id
    state.middlePile = MiddlePile(gameState.middlePile)
    state.deck = Deck(gameState.deck)
    state.player1 = Player(gameState.player1)
    state.player2 = Player(gameState.player2)
    state.players=[state.player1, state.player2]
    state.trumpCard = Card(gameState.trumpCard)
    state.firstPlayerToActByIndex = gameState.firstPlayerToActByIndex
    state.currentPlayerToActByIndex = gameState.currentPlayerToActByIndex
    state.playerForClientSide = gameState.playerForClientSide

    let game = Object.assign(state,
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
            
            state.deck = Deck()
            state.deck.generateDeck();
            state.deck.shuffle();
            const hand1 = Hand()
            hand1.addCards([state.deck.drawCard(), state.deck.drawCard(), state.deck.drawCard()])
            const hand2 = Hand()
            hand2.addCards([state.deck.drawCard(), state.deck.drawCard(), state.deck.drawCard()])
            state.player1 = Player()
            state.player1.hand = hand1
            state.player2 = Player()
            state.player2.hand = hand2
            state.players = [state.player1, state.player2]
            state.trumpCard = state.deck.drawTrumpCard()
            state.middlePile = MiddlePile({trumpCard:state.trumpCard})

            state.firstPlayerToActByIndex = 0
            state.currentPlayerToActByIndex = state.firstPlayerToActByIndex
            state.playerForClientSide;
        },
        next: function()
        {
            if(!state.isRoundOver())
            {
                state.currentPlayerToActByIndex = (state.currentPlayerToActByIndex + 1) % Constants.gameConstants.NUMBER_OF_PLAYERS;
            }
        },
        isRoundOver: function()
        {
            return state.middlePile.isPileComplete();
        },
        isLastDeal: function()
        {
            return state.deck.cards.length - Constants.gameConstants.NUMBER_OF_PLAYERS === 0;
        },
        isDeckEmpty: function()
        {
            return state.deck.cards.length === 0;
        },
        /**
         * winning for the particular round
         */
        getWinningPlayerIndex : function()
        {
            return (state.firstPlayerToActByIndex + state.middlePile.decideWinningCardIndex()) % Constants.gameConstants.NUMBER_OF_PLAYERS
        },
        /**
         * winning for the particular round
         */
        getWinningPlayer : function()
        {
            return state.players[state.getWinningPlayerIndex()]
        },
        isGameOver: function()
        {
            return state.deck.cards.length === 0 && state.players.every((player)=>player.hand.cards.length ===0)
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