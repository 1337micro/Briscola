import { Deck } from './Deck.js'
import { Hand } from './Hand.js'
import { Player } from './Player.js'
import { Card } from './Card.js'
import { MiddlePile } from './MiddlePile.js'
import { Constants } from './Constants.js'
import { BriscolaError } from './errors/BriscolaError.js'
function Game(gameState = {})
{
    let state = {}
    state._id = gameState._id //game id
    state.middlePile = new MiddlePile(gameState.middlePile)
    state.deck = Deck(gameState.deck)
    state.player1 = Player(gameState.player1)
    state.player2 = Player(gameState.player2)
    state.players=[state.player1, state.player2]
    state.trumpCard = new Card(gameState.trumpCard)
    state.firstPlayerToActByIndex = gameState.firstPlayerToActByIndex
    state.currentPlayerToActByIndex = gameState.currentPlayerToActByIndex
    state.playerForClientSide = gameState.playerForClientSide
    state.history = gameState.history
    state.started = gameState.started
    state.singlePlayer = gameState.singlePlayer
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
            const hand1 = new Hand()
            hand1.addCards([state.deck.drawCard(), state.deck.drawCard(), state.deck.drawCard()])
            const hand2 = new Hand()
            hand2.addCards([state.deck.drawCard(), state.deck.drawCard(), state.deck.drawCard()])
            state.player1 = Player()
            state.player1.hand = hand1
            state.player2 = Player()
            state.player2.hand = hand2
            state.players = [state.player1, state.player2]
            state.trumpCard = state.deck.drawTrumpCard()
            state.middlePile = new MiddlePile({trumpCard:state.trumpCard})

            state.firstPlayerToActByIndex = 0
            state.currentPlayerToActByIndex = state.firstPlayerToActByIndex
            state.playerForClientSide;
            state.history = "";
            state.started = false;
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
            const winningPlayerIndex = state.getWinningPlayerIndex()

            let indexOfPlayerToGetNextCard = winningPlayerIndex
            do{
                let nextCard = state.deck.drawCard()
                state.players[indexOfPlayerToGetNextCard].hand.addCard(nextCard)
                indexOfPlayerToGetNextCard = (indexOfPlayerToGetNextCard + 1) % Constants.gameConstants.NUMBER_OF_PLAYERS
            }
            while(indexOfPlayerToGetNextCard != winningPlayerIndex)
        },
        addCardToHistory : function(card,playerIndex)
        {
            if(card == undefined || playerIndex == undefined)
            {
                throw new BriscolaError("Cannot add play to history, playerIndex or card undefined")
            }
            else
            {
                state.history += ("p"+playerIndex+ " " + card.rank + card.suit + " ")
            }
            
        },
        computerMove: function(){
            if(state.singlePlayer) {
                let playerIndex = state.currentPlayerToActByIndex;
                let player = state.players[playerIndex];
                let playerHand = player.hand;
                if (player.socketId == null && playerHand.cards.length > 0) {
                    const card = state.computerAI(playerHand)
                    //the current player to act is the computer and has some cards to play
                    state.addCardToHistory(card, playerIndex);
                    playerHand.removeCard(card)//remove card from player's hand
                    let middlePile = state.middlePile
                    middlePile.addCard(card)//add card to middle pile
                    state.next()
                    return card;
                }
            }
        },
        computerAI: function (computerHand) {
            const trumpCard = state.middlePile.trumpCard
            //player hand sorted ascending in point value
            const sortedComputerCards = computerHand.cards.sort((cardA, cardB) => cardA.points - cardB.points);
            const ourTrumpCards = sortedComputerCards.filter(card => card.suit === trumpCard.suit)
            const ourNonTrumpCards = sortedComputerCards.filter(card => card.suit !== trumpCard.suit)
            console.log(JSON.stringify(sortedComputerCards))
            let worstCardInHand;
            if(ourTrumpCards.length === sortedComputerCards.length) {
                //all our cards are trump cards, take the lowest trump card as the worst card
                worstCardInHand = ourTrumpCards[0]
            } else {
                //take the lowest non-trump card
                worstCardInHand = ourNonTrumpCards[0];
            }

            const cardsInMiddle = state.middlePile.cards
            if(cardsInMiddle.length === 0) {
                //Computer is first to act, play leech
                return worstCardInHand
            }
            else {
                //Computer is second to act
                const cardAlreadyPlayedInMiddle = cardsInMiddle[0]
                if(cardAlreadyPlayedInMiddle.suit === trumpCard.suit) {
                    //player played a trump suit first, give him the lowest points possible
                    return worstCardInHand;
                }
                else {
                    //player played a non-trump card
                    const ourCardsOfSameSuit = sortedComputerCards.filter(card => card.suit === cardAlreadyPlayedInMiddle.suit);
                    if(ourCardsOfSameSuit.length === 0) {
                        //no cards of same suit
                        const middleCardValue = cardAlreadyPlayedInMiddle.points;
                        if(middleCardValue == undefined || middleCardValue < 3) {
                            //the card in the middle pile is worth nothing, or less than a b**ch, so play your worst card
                            return worstCardInHand
                        }
                        else {
                            //the card in the middle is worth something meaningful, so we try to take it
                            const ourTrumpCards = sortedComputerCards.filter(card => card.suit === trumpCard.suit)
                            if(ourTrumpCards.length > 0) {
                                //We have some trump cards, so let's play lowest one
                                return ourTrumpCards[0]
                            }
                            else {
                                //we are unable to take the card, play the worst card in hand
                                return worstCardInHand;
                            }
                        }
                    }
                    else {
                        //play highest card of same suit
                        return ourCardsOfSameSuit[ourCardsOfSameSuit.length-1]
                    }
                }


            }
        },
        //play a round at random for testing
        _playRound : function()
        {
            const currentPlayerToActByIndex = state.currentPlayerToActByIndex
            const otherPlayerToActByIndex = (currentPlayerToActByIndex + 1) % Constants.gameConstants.NUMBER_OF_PLAYERS

            const currentPlayerToAct = state.players[currentPlayerToActByIndex]
            const otherPlayer = state.players[otherPlayerToActByIndex]

            state.middlePile = new MiddlePile(state.middlePile)
            const firstCardPlayed = currentPlayerToAct.hand.cards.pop()
            state.addCardToHistory(firstCardPlayed, currentPlayerToActByIndex)
            const secondCardPlayed = otherPlayer.hand.cards.pop()
            state.addCardToHistory(secondCardPlayed, otherPlayerToActByIndex)

            state.middlePile.addCard(firstCardPlayed)
            state.middlePile.addCard(secondCardPlayed)

            let winningPlayer = state.getWinningPlayer()
            let winningPlayerIndex =  state.getWinningPlayerIndex()

            state.currentPlayerToActByIndex = winningPlayerIndex
            state.firstPlayerToActByIndex = state.currentPlayerToActByIndex;
            winningPlayer.pile.addCards(state.middlePile.cards)
            state.middlePile.reset()

            if(!state.isDeckEmpty())
            {
                state.dealNextCardToAllPlayers()
            }

        }
    }
}


export { Game }