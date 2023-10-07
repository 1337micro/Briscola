import {Deck} from './Deck.js'
import {Hand} from './Hand.js'
import {Player} from './Player.js'
import {Card} from './Card.js'
import {MiddlePile} from './MiddlePile.js'
import {Constants} from './Constants.js'
import {BriscolaError} from './errors/BriscolaError.js'
import Node from "../../backend/ai/Node";
import MC from "../../backend/ai/MC";

class Game {
    constructor(gameState = {}) {
        this._id = gameState._id //game id
        this.middlePile = new MiddlePile(gameState.middlePile)
        this.deck = new Deck(gameState.deck)
        this.player1 = new Player(gameState.player1)
        this.player2 = new Player(gameState.player2)
        this.players = [this.player1, this.player2]
        this.trumpCard = new Card(gameState.trumpCard)
        this.firstPlayerToActByIndex = gameState.firstPlayerToActByIndex
        this.currentPlayerToActByIndex = gameState.currentPlayerToActByIndex
        this.playerForClientSide = gameState.playerForClientSide
        this.history = gameState.history
        this.started = gameState.started
        this.singlePlayer = gameState.singlePlayer
    }

    init() {

        this.deck = new Deck()
        this.deck.generateDeck();
        this.deck.shuffle();
        const hand1 = new Hand()
        hand1.addCards([this.deck.drawCard(), this.deck.drawCard(), this.deck.drawCard()])
        const hand2 = new Hand()
        hand2.addCards([this.deck.drawCard(), this.deck.drawCard(), this.deck.drawCard()])
        this.player1 = new Player()
        this.player1.hand = hand1
        this.player2 = new Player()
        this.player2.hand = hand2
        this.players = [this.player1, this.player2]
        this.trumpCard = this.deck.drawTrumpCard()
        this.middlePile = new MiddlePile({trumpCard: this.trumpCard})

        this.firstPlayerToActByIndex = 0
        this.currentPlayerToActByIndex = this.firstPlayerToActByIndex
        this.playerForClientSide;
        this.history = "";
        this.started = false;
    }

    repr() {
        return `
            Deck: ${this.deck.repr()}
            Player1 hand: ${this.player1.hand.repr()}
            Player2 hand: ${this.player2.hand.repr()}
            
            Player To Act: ${this.currentPlayerToActByIndex}
        `
    }

    getPlayerWaitingIndex() {
        return (this.currentPlayerToActByIndex + 1) % Constants.gameConstants.NUMBER_OF_PLAYERS
    }

    getPlayerWaiting() {
        return this.players[this.getPlayerWaitingIndex()];
    }

    getPlayerToAct() {
        return this.players[this.getPlayerIndexToAct()]
    }

    getPlayerIndexToAct() {
        return this.currentPlayerToActByIndex;
    }

    playCard(card, playerIndex) {
        let game = this;
        //let playerIndex = session.playerIndex;
        let player = game.players[playerIndex];
        game.playerForClientSide = player
        let playerHand = player.hand;
        game.addCardToHistory(card, playerIndex);
        playerHand.removeCard(card)//remove card from player's hand
        let middlePile = game.middlePile
        middlePile.addCard(card)//add card to middle pile

        game.next()
        //socket.emit(Constants.events.CARD_PLAYED_CONFIRMED, cardPlayed)//notify client to remove the card from his hand
        //computerMove(game, Constants.events.COMPUTER_CARD_PLAYED);
        if (game.isRoundOver()) {
            let winningPlayer = game.getWinningPlayer()
            winningPlayer.pile.addCards(game.middlePile.cards)

            if (game.isLastDeal()) {
                //emitEvent(game, Constants.events.LAST_DEAL)//should be a condition to only send this event once
            }
            if (!game.isDeckEmpty()) {
                game.dealNextCardToAllPlayers()
            }

            let winningPlayerIndex = game.getWinningPlayerIndex()
            game.currentPlayerToActByIndex = winningPlayerIndex
            game.firstPlayerToActByIndex = game.currentPlayerToActByIndex;

            game.middlePile.reset()//reset only after dealing the next cards

            if (game.isGameOver()) {
                game.players[0].points = game.players[0].pile.countPoints()
                game.players[1].points = game.players[1].pile.countPoints()
                //emitGameOver(game)
            }

        }
    }

    next() {
        if (!this.isRoundOver()) {
            this.currentPlayerToActByIndex = (this.currentPlayerToActByIndex + 1) % Constants.gameConstants.NUMBER_OF_PLAYERS;
        }
    }

    isRoundOver() {
        return this.middlePile.isPileComplete();
    }

    isLastDeal() {
        return this.deck.cards.length - Constants.gameConstants.NUMBER_OF_PLAYERS === 0;
    }

    isDeckEmpty() {
        return this.deck.cards.length === 0;
    }

    /**
     * winning for the particular round
     */
    getWinningPlayerIndex() {
        return (this.firstPlayerToActByIndex + this.middlePile.decideWinningCardIndex()) % Constants.gameConstants.NUMBER_OF_PLAYERS
    }

    /**
     * winning for the particular round
     */
    getWinningPlayer() {
        return this.players[this.getWinningPlayerIndex()]
    }

    isGameOver() {
        return this.deck.cards.length === 0 && this.players.every((player) => player.hand.cards.length === 0)
    }

    autoSetNextToAct() {
        this.currentPlayerToActByIndex = this.getWinningPlayerIndex()
    }

    dealNextCardToAllPlayers() {
        const winningPlayerIndex = this.getWinningPlayerIndex()

        let indexOfPlayerToGetNextCard = winningPlayerIndex
        do {
            let nextCard = this.deck.drawCard()
            this.players[indexOfPlayerToGetNextCard].hand.addCard(nextCard)
            indexOfPlayerToGetNextCard = (indexOfPlayerToGetNextCard + 1) % Constants.gameConstants.NUMBER_OF_PLAYERS
        }
        while (indexOfPlayerToGetNextCard != winningPlayerIndex)
    }

    addCardToHistory(card, playerIndex) {
        if (card == undefined || playerIndex == undefined) {
            throw new BriscolaError("Cannot add play to history, playerIndex or card undefined")
        } else {
            this.history += ("p" + playerIndex + " " + card.rank + card.suit + " ")
        }

    }

    computerMove() {
        if (this.singlePlayer) {
            let playerIndex = this.currentPlayerToActByIndex;
            let player = this.players[playerIndex];
            let playerHand = player.hand;
            if (player.socketId == null && playerHand.cards.length > 0) {
                const rootNode = new Node({game: this});
                const monteCarlo = MC(rootNode)
                monteCarlo.buildTree(rootNode);
                const card = monteCarlo.getNextCardToPlay();
                //the current player to act is the computer and has some cards to play
                this.addCardToHistory(card, playerIndex);
                playerHand.removeCard(card)//remove card from player's hand
                let middlePile = this.middlePile
                middlePile.addCard(card)//add card to middle pile
                this.next()
                return card;
            }
        }
    }

    computerAIDecisionBranch(computerHand) {
        const trumpCard = this.middlePile.trumpCard
        //player hand sorted ascending in point value
        const sortedComputerCards = computerHand.cards.sort((cardA, cardB) => cardA.points - cardB.points);
        const ourTrumpCards = sortedComputerCards.filter(card => card.suit === trumpCard.suit)
        const ourNonTrumpCards = sortedComputerCards.filter(card => card.suit !== trumpCard.suit)
        let worstCardInHand;
        if (ourTrumpCards.length === sortedComputerCards.length) {
            //all our cards are trump cards, take the lowest trump card as the worst card
            worstCardInHand = ourTrumpCards[0]
        } else {
            //take the lowest non-trump card
            worstCardInHand = ourNonTrumpCards[0];
        }

        const cardsInMiddle = this.middlePile.cards
        if (cardsInMiddle.length === 0) {
            //Computer is first to act, play leech
            return worstCardInHand
        } else {
            //Computer is second to act
            const cardAlreadyPlayedInMiddle = cardsInMiddle[0]
            if (cardAlreadyPlayedInMiddle.suit === trumpCard.suit) {
                //player played a trump suit first, give him the lowest points possible
                return worstCardInHand;
            } else {
                //player played a non-trump card
                const ourCardsOfSameSuit = sortedComputerCards.filter(card => card.suit === cardAlreadyPlayedInMiddle.suit);
                if (ourCardsOfSameSuit.length === 0) {
                    //no cards of same suit
                    const middleCardValue = cardAlreadyPlayedInMiddle.points;
                    if (middleCardValue == undefined || middleCardValue < 3) {
                        //the card in the middle pile is worth nothing, or less than a b**ch, so play your worst card
                        return worstCardInHand
                    } else {
                        //the card in the middle is worth something meaningful, so we try to take it
                        const ourTrumpCards = sortedComputerCards.filter(card => card.suit === trumpCard.suit)
                        if (ourTrumpCards.length > 0) {
                            //We have some trump cards, so let's play lowest one
                            return ourTrumpCards[0]
                        } else {
                            //we are unable to take the card, play the worst card in hand
                            return worstCardInHand;
                        }
                    }
                } else {
                    //play highest card of same suit
                    return ourCardsOfSameSuit[ourCardsOfSameSuit.length - 1]
                }
            }


        }
    }

    //play a round at random for testing
    _playRound() {
        const currentPlayerToActByIndex = this.currentPlayerToActByIndex
        const otherPlayerToActByIndex = (currentPlayerToActByIndex + 1) % Constants.gameConstants.NUMBER_OF_PLAYERS

        const currentPlayerToAct = this.players[currentPlayerToActByIndex]
        const otherPlayer = this.players[otherPlayerToActByIndex]

        this.middlePile = new MiddlePile(this.middlePile)
        const firstCardPlayed = currentPlayerToAct.hand.cards.pop()
        this.addCardToHistory(firstCardPlayed, currentPlayerToActByIndex)
        const secondCardPlayed = otherPlayer.hand.cards.pop()
        this.addCardToHistory(secondCardPlayed, otherPlayerToActByIndex)

        this.middlePile.addCard(firstCardPlayed)
        this.middlePile.addCard(secondCardPlayed)

        let winningPlayer = this.getWinningPlayer()
        let winningPlayerIndex = this.getWinningPlayerIndex()

        this.currentPlayerToActByIndex = winningPlayerIndex
        this.firstPlayerToActByIndex = this.currentPlayerToActByIndex;
        winningPlayer.pile.addCards(this.middlePile.cards)
        this.middlePile.reset()

        if (!this.isDeckEmpty()) {
            this.dealNextCardToAllPlayers()
        }
    }
}


export {Game}