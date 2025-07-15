"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Game = void 0;

var _Deck = require("./Deck.js");

var _Hand = require("./Hand.js");

var _Player = require("./Player.js");

var _Card = require("./Card.js");

var _MiddlePile = require("./MiddlePile.js");

var _Constants = require("./Constants.js");

var _BriscolaError = require("./errors/BriscolaError.js");

class Game {
  constructor(gameState = {}) {
    this._id = gameState._id; //game id

    this.gameVariant = gameState.gameVariant || _Constants.Constants.gameVariants.TRADITIONAL;
    this.middlePile = new _MiddlePile.MiddlePile(gameState.middlePile);
    this.deck = new _Deck.Deck(gameState.deck);
    this.player1 = new _Player.Player(gameState.player1);
    this.player2 = new _Player.Player(gameState.player2);
    this.players = [this.player1, this.player2];
    this.trumpCard = new _Card.Card(gameState.trumpCard);
    this.trumpSuit = gameState.trumpSuit; // For Briscola 500 when trump is declared
    this.trumpDeclared = gameState.trumpDeclared || false; // Track if trump has been declared
    this.firstPlayerToActByIndex = gameState.firstPlayerToActByIndex;
    this.currentPlayerToActByIndex = gameState.currentPlayerToActByIndex;
    this.playerForClientSide = gameState.playerForClientSide;
    this.history = gameState.history;
    this.started = gameState.started;
    this.singlePlayer = gameState.singlePlayer;
  }

  init() {
    this.deck = new _Deck.Deck();
    this.deck.generateDeck();
    this.deck.shuffle();
    const cardsPerHand = _Constants.Constants.gameConstants.VARIANT_CONFIG[this.gameVariant].CARDS_PER_HAND;
    const hand1 = new _Hand.Hand(this.gameVariant);
    const cardsForPlayer1 = [];

    for (let i = 0; i < cardsPerHand; i++) {
      cardsForPlayer1.push(this.deck.drawCard());
    }

    hand1.addCards(cardsForPlayer1);
    const hand2 = new _Hand.Hand(this.gameVariant);
    const cardsForPlayer2 = [];

    for (let i = 0; i < cardsPerHand; i++) {
      cardsForPlayer2.push(this.deck.drawCard());
    }

    hand2.addCards(cardsForPlayer2);
    this.player1 = new _Player.Player();
    this.player1.hand = hand1;
    this.player2 = new _Player.Player();
    this.player2.hand = hand2;
    this.players = [this.player1, this.player2];
    
    // For traditional variant, draw trump card. For Briscola 500, no initial trump
    if (this.gameVariant === _Constants.Constants.gameVariants.TRADITIONAL) {
      this.trumpCard = this.deck.drawTrumpCard();
      this.middlePile = new _MiddlePile.MiddlePile({
        trumpCard: this.trumpCard
      });
    } else {
      // Briscola 500: no initial trump card
      this.trumpCard = null;
      this.trumpSuit = null;
      this.trumpDeclared = false;
      this.middlePile = new _MiddlePile.MiddlePile({
        trumpCard: null
      });
    }
    
    this.firstPlayerToActByIndex = 0;
    this.currentPlayerToActByIndex = this.firstPlayerToActByIndex;
    this.playerForClientSide;
    this.history = "";
    this.started = false;
  }

  next() {
    if (!this.isRoundOver()) {
      this.currentPlayerToActByIndex = (this.currentPlayerToActByIndex + 1) % _Constants.Constants.gameConstants.NUMBER_OF_PLAYERS;
    }
  }

  isRoundOver() {
    return this.middlePile.isPileComplete();
  }

  isLastDeal() {
    return this.deck.cards.length - _Constants.Constants.gameConstants.NUMBER_OF_PLAYERS === 0;
  }

  isDeckEmpty() {
    return this.deck.cards.length === 0;
  }
  /**
   * winning for the particular round
   */


  getWinningPlayerIndex() {
    return (this.firstPlayerToActByIndex + this.middlePile.decideWinningCardIndex()) % _Constants.Constants.gameConstants.NUMBER_OF_PLAYERS;
  }
  /**
   * winning for the particular round
   */


  getWinningPlayer() {
    return this.players[this.getWinningPlayerIndex()];
  }

  isGameOver() {
    return this.deck.cards.length === 0 && this.players.every(player => player.hand.cards.length === 0);
  }

  autoSetNextToAct() {
    this.currentPlayerToActByIndex = this.getWinningPlayerIndex();
  }

  dealNextCardToAllPlayers() {
    const winningPlayerIndex = this.getWinningPlayerIndex();
    this.dealNextCardToAllPlayersStartingWith(winningPlayerIndex);
  }

  dealNextCardToAllPlayersStartingWith(winningPlayerIndex) {
    let indexOfPlayerToGetNextCard = winningPlayerIndex;

    do {
      let nextCard = this.deck.drawCard();
      this.players[indexOfPlayerToGetNextCard].hand.addCard(nextCard);
      indexOfPlayerToGetNextCard = (indexOfPlayerToGetNextCard + 1) % _Constants.Constants.gameConstants.NUMBER_OF_PLAYERS;
    } while (indexOfPlayerToGetNextCard != winningPlayerIndex);
  }

  addCardToHistory(card, playerIndex) {
    if (card == undefined || playerIndex == undefined) {
      throw new _BriscolaError.BriscolaError("Cannot add play to history, playerIndex or card undefined");
    } else {
      this.history += "p" + playerIndex + " " + card.rank + card.suit + " ";
    }
  }

  computerMove() {
    if (this.singlePlayer) {
      let playerIndex = this.currentPlayerToActByIndex;
      let player = this.players[playerIndex];
      let playerHand = player.hand;

      if (player.socketId == null && playerHand.cards.length > 0) {
        const card = this.computerAI(playerHand); //the current player to act is the computer and has some cards to play

        this.addCardToHistory(card, playerIndex);
        playerHand.removeCard(card); //remove card from player's hand

        let middlePile = this.middlePile;
        middlePile.addCard(card); //add card to middle pile

        this.next();
        return card;
      }
    }
  }

  computerAI(computerHand) {
    // Get trump suit - either from trump card (traditional) or declared trump (Briscola 500)
    const trumpSuit = this.getTrumpSuit();
    
    //player hand sorted ascending in point value
    const sortedComputerCards = computerHand.cards.sort((cardA, cardB) => cardA.points - cardB.points);
    const ourTrumpCards = trumpSuit ? sortedComputerCards.filter(card => card.suit === trumpSuit) : [];
    const ourNonTrumpCards = trumpSuit ? sortedComputerCards.filter(card => card.suit !== trumpSuit) : sortedComputerCards;
    let worstCardInHand;

    if (ourTrumpCards.length === sortedComputerCards.length) {
      //all our cards are trump cards, take the lowest trump card as the worst card
      worstCardInHand = ourTrumpCards[0];
    } else {
      //take the lowest non-trump card
      worstCardInHand = ourNonTrumpCards[0];
    }

    const cardsInMiddle = this.middlePile.cards;

    if (cardsInMiddle.length === 0) {
      //Computer is first to act, play leech
      return worstCardInHand;
    } else {
      //Computer is second to act
      const cardAlreadyPlayedInMiddle = cardsInMiddle[0];

      if (trumpSuit && cardAlreadyPlayedInMiddle.suit === trumpSuit) {
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
            return worstCardInHand;
          } else {
            //the card in the middle is worth something meaningful, so we try to take it
            const ourTrumpCards = trumpSuit ? sortedComputerCards.filter(card => card.suit === trumpSuit) : [];

            if (ourTrumpCards.length > 0) {
              //We have some trump cards, so let's play lowest one
              return ourTrumpCards[0];
            } else {
              //we are unable to take the card, play the worst card in hand
              return worstCardInHand;
            }
          }
        } else {
          //play highest card of same suit
          return ourCardsOfSameSuit[ourCardsOfSameSuit.length - 1];
        }
      }
    }
  } //play a round at random for testing


  _playRound() {
    const currentPlayerToActByIndex = this.currentPlayerToActByIndex;
    const otherPlayerToActByIndex = (currentPlayerToActByIndex + 1) % _Constants.Constants.gameConstants.NUMBER_OF_PLAYERS;
    const currentPlayerToAct = this.players[currentPlayerToActByIndex];
    const otherPlayer = this.players[otherPlayerToActByIndex];
    this.middlePile = new _MiddlePile.MiddlePile(this.middlePile);
    const firstCardPlayed = currentPlayerToAct.hand.cards.pop();
    this.addCardToHistory(firstCardPlayed, currentPlayerToActByIndex);
    const secondCardPlayed = otherPlayer.hand.cards.pop();
    this.addCardToHistory(secondCardPlayed, otherPlayerToActByIndex);
    this.middlePile.addCard(firstCardPlayed);
    this.middlePile.addCard(secondCardPlayed);
    let winningPlayer = this.getWinningPlayer();
    let winningPlayerIndex = this.getWinningPlayerIndex();
    this.currentPlayerToActByIndex = winningPlayerIndex;
    this.firstPlayerToActByIndex = this.currentPlayerToActByIndex;
    winningPlayer.pile.addCards(this.middlePile.cards);
    this.middlePile.reset();

    if (!this.isDeckEmpty()) {
      this.dealNextCardToAllPlayersStartingWith(winningPlayerIndex);
    }
  }

  // Get the current trump suit (either from trump card or declared trump)
  getTrumpSuit() {
    if (this.gameVariant === _Constants.Constants.gameVariants.TRADITIONAL) {
      return this.trumpCard ? this.trumpCard.suit : null;
    } else {
      // Briscola 500
      return this.trumpSuit;
    }
  }

  // Check if a player can declare trump with king+horse combination
  canDeclareTrump(playerIndex, suit) {
    if (this.gameVariant !== _Constants.Constants.gameVariants.BRISCOLA_500) {
      return false; // Only for Briscola 500
    }
    
    if (this.trumpDeclared) {
      return false; // Trump already declared
    }

    const player = this.players[playerIndex];
    const playerCards = player.hand.cards;
    
    // Check if player has both king and horse of the specified suit
    const hasKing = playerCards.some(card => card.rank === _Constants.Constants.gameConstants.RANKS.KING && card.suit === suit);
    const hasHorse = playerCards.some(card => card.rank === _Constants.Constants.gameConstants.RANKS.HORSE && card.suit === suit);
    
    return hasKing && hasHorse;
  }

  // Declare trump suit for Briscola 500
  declareTrump(playerIndex, suit) {
    if (!this.canDeclareTrump(playerIndex, suit)) {
      return false;
    }

    this.trumpSuit = suit;
    this.trumpDeclared = true;
    
    // Update middle pile with the new trump suit
    this.middlePile.trumpSuit = suit;
    
    return true;
  }

  // Get available trump declarations for a player
  getAvailableTrumpDeclarations(playerIndex) {
    if (this.gameVariant !== _Constants.Constants.gameVariants.BRISCOLA_500 || this.trumpDeclared) {
      return [];
    }

    const player = this.players[playerIndex];
    const playerCards = player.hand.cards;
    const suits = ['s', 'c', 'd', 'b']; // spade, coppe, denari, bastoni
    const availableDeclarations = [];

    suits.forEach(suit => {
      if (this.canDeclareTrump(playerIndex, suit)) {
        availableDeclarations.push(suit);
      }
    });

    return availableDeclarations;
  }

}

exports.Game = Game;