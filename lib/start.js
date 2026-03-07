"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.start = start;

var _app = require("./app.js");

var _Constants = require("./Constants.js");

var _eventHandlers = require("./eventHandlers.js");

var _sprites = require("./utils/sprites.js");

var _generators = require("./utils/generators.js");

var _general = require("./utils/general.js");

var _scaleWindow = require("./utils/scaleWindow.js");

const PLAY_CARD_SOUND = new Howl({
  src: [_Constants.Constants.soundUrl.PLAY_CARD],
  volume: 0.35
});
const SHUFFLE_CARDS_SOUND = new Howl({
  src: [_Constants.Constants.soundUrl.SHUFFLE_CARDS],
  volume: 0.25
});
const HORSE_RANK = 9;
const KING_RANK = 10;
let game;
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

async function start() {
  (0, _eventHandlers.onRedirect)(newUrl => {
    window.location.assign(newUrl);
  });
  (0, _general.isSinglePlayer)() ? (0, _eventHandlers.requestSinglePlayerGameStart)() : (0, _eventHandlers.requestGameStart)((0, _general.getLobbyName)());
  game = await (0, _eventHandlers.getGame)().catch(error => {
    console.error(error);
    redirectToNewGame();
  }); //game starts after this point

  SHUFFLE_CARDS_SOUND.play();
  (0, _general.hideGreeting)(); //Add the canvas that Pixi automatically created for you to the HTML document

  document.body.appendChild(_app.app.view);
  let playerToActText = (0, _generators.generatePlayerToActText)(game);

  _app.app.stage.addChild(playerToActText);

  let yourNameText = (0, _generators.generateYourPlayerNameText)(game);

  _app.app.stage.addChild(yourNameText);

  let deckCountText = (0, _generators.generateDeckCount)(game);

  _app.app.stage.addChild(deckCountText);

  let trumpSuitText = (0, _generators.generateTrumpSuitTextSprite)(game.trumpSuit);

  _app.app.stage.addChild(trumpSuitText);

  let middlePileCardSprites = [];
  let horseKingButtons = [];
  let misdealButtonSprite = null;
  (0, _eventHandlers.onGameUpdate)(newGameObj => {
    game = newGameObj;
    (0, _sprites.removeHandCardSprites)(cardSprites);
    cardSprites = addPlayerHandSprites(game);
    (0, _sprites.removeHandCardSprites)(opponentBackOfCardSprites);
    opponentBackOfCardSprites = (0, _sprites._generateOpponentCardSprites)(game);
    setUpOpponentBackOfCards(opponentBackOfCardSprites);
    removePlayerToActText(playerToActText);
    playerToActText = (0, _generators.generatePlayerToActText)(game);

    _app.app.stage.addChild(playerToActText);

    removeDeckCountSprite(deckCountText);
    deckCountText = (0, _generators.generateDeckCount)(game);

    _app.app.stage.addChild(deckCountText);

    _app.app.stage.removeChild(trumpSuitText);

    trumpSuitText = (0, _generators.generateTrumpSuitTextSprite)(game.trumpSuit);

    _app.app.stage.addChild(trumpSuitText);

    updateHorseKingButtons(game);
  });
  (0, _eventHandlers.onCardPlayed)(cardPlayed => {
    //add the card to the middlePile
    PLAY_CARD_SOUND.play();
    addPileCard(cardPlayed);
    removePlayerToActText(playerToActText);
    playerToActText = (0, _generators.generatePlayerToActText)(game);

    _app.app.stage.addChild(playerToActText);
  });
  (0, _eventHandlers.onComputerCardPlayed)(cardPlayed => {
    setTimeout(() => {
      //add the card to the middlePile
      PLAY_CARD_SOUND.play();
      addPileCard(cardPlayed);
      removePlayerToActText(playerToActText);
      playerToActText = (0, _generators.generatePlayerToActText)(game);

      _app.app.stage.addChild(playerToActText);
    }, 1000);
  });
  (0, _eventHandlers.onFirstToActComputerCardPlayed)(cardPlayed => {
    setTimeout(() => {
      //add the card to the middlePile
      PLAY_CARD_SOUND.play();
      addPileCard(cardPlayed);
      removePlayerToActText(playerToActText);
      playerToActText = (0, _generators.generatePlayerToActText)(game);

      _app.app.stage.addChild(playerToActText);
    }, 2000);
  });
  (0, _eventHandlers.onRoundOver)(winningPlayer => {
    function removePileCards() {
      (0, _sprites.removeMiddlePileCardSprites)(middlePileCardSprites);

      if (middlePileCardSprites.length > _Constants.Constants.gameConstants.NUMBER_OF_PLAYERS) {
        middlePileCardSprites = middlePileCardSprites.slice(_Constants.Constants.gameConstants.NUMBER_OF_PLAYERS);
      } else if (middlePileCardSprites.length === _Constants.Constants.gameConstants.NUMBER_OF_PLAYERS) {
        middlePileCardSprites.length = 0;
      }
    }

    setTimeout(removePileCards, 3000);
  });
  (0, _eventHandlers.onBriskCalled)(suit => {
    PLAY_CARD_SOUND.play();
    PLAY_CARD_SOUND.play();
    let horse = (0, _sprites._generateCardSprite)(`../images/9${suit}.png`);
    let king = (0, _sprites._generateCardSprite)(`../images/10${suit}.png`);
    const briscolaCalledText = new PIXI.Text(`BRISCOLA of ${_Constants.Constants.gameConstants.MAP_ABBREVIATION_TO_SUITS[suit]} has been called`);
    (0, _sprites._positionBriskCalledSprite)(horse, 0);
    (0, _sprites._positionBriskCalledSprite)(king, 1);
    (0, _sprites._positionBriskCalledText)(briscolaCalledText);
    (0, _sprites._scaleSpriteDownTo)(0.5, horse);
    (0, _sprites._scaleSpriteDownTo)(0.5, king);
    addCardSpriteToStage(horse);
    addCardSpriteToStage(king);
    addCardSpriteToStage(briscolaCalledText);
    setTimeout(() => {
      _app.app.stage.removeChild(horse);

      _app.app.stage.removeChild(king);

      _app.app.stage.removeChild(briscolaCalledText);
    }, 3000);
  });
  (0, _eventHandlers.onLastDeal)(() => {
    if (trumpCardSprite) {
      (0, _sprites._removeSprite)(trumpCardSprite);
    }

    if (backOfDeckSprite) {
      (0, _sprites._removeSprite)(backOfDeckSprite);
    }
  });
  (0, _eventHandlers.onGameOver)(game => {
    //remove all elements
    removeAllSpritesOnScreen();
    let textFontSize = 24;
    let textPositionX = 0;
    let textPositionY = screenHeight / 2;
    const gameOverStyle = {
      fontFamily: 'Arial',
      fontSize: textFontSize,
      align: 'center'
    };
    const gameOverText = new PIXI.Text('Game over.', gameOverStyle);
    gameOverText.x = textPositionX;
    gameOverText.y = textPositionY;
    textPositionY = textPositionY + textFontSize + 5;
    const myPlayerObject = (0, _general.getMyPlayerObject)(game);
    const opponentPlayer = (0, _general.getOpponentPlayer)(game);
    const pointsText = new PIXI.Text('Your points: ' + myPlayerObject.points + ', Opponent points: ' + opponentPlayer.points, gameOverStyle);
    pointsText.x = textPositionX;
    pointsText.y = textPositionY;
    textPositionY = textPositionY + textFontSize + 5;
    let winningText;

    if (myPlayerObject.points > opponentPlayer.points) {
      //I win
      winningText = new PIXI.Text("You win.", gameOverStyle);
    } else if (myPlayerObject.points === opponentPlayer.points) {
      winningText = new PIXI.Text("Tie game.", gameOverStyle);
    } else {
      winningText = new PIXI.Text("Opponent wins.", gameOverStyle);
    }

    winningText.x = textPositionX;
    winningText.y = textPositionY;

    _app.app.stage.addChild(gameOverText);

    _app.app.stage.addChild(pointsText);

    _app.app.stage.addChild(winningText);
  });
  (0, _eventHandlers.onServerConnectionLost)(reason => {
    removeAllSpritesOnScreen();
    const gameOverStyle = {
      fontFamily: 'Arial',
      fontSize: 24,
      align: 'center'
    };
    const gameOverText = new PIXI.Text('Server connection lost. Game aborted. ', gameOverStyle);
    gameOverText.x = screenWidth / 2;
    gameOverText.y = screenHeight / 2;

    _app.app.stage.addChild(gameOverText);
  });
  (0, _eventHandlers.onOpponentLeft)(reason => {
    removeAllSpritesOnScreen();
    const gameOverStyle = {
      fontFamily: 'Arial',
      fontSize: 24,
      align: 'center'
    };
    const gameOverText = new PIXI.Text('Opponent Left. Game aborted. ', gameOverStyle);
    gameOverText.x = screenWidth / 2;
    gameOverText.y = screenHeight / 2;

    _app.app.stage.addChild(gameOverText);
  });

  function redirectToNewGame() {
    window.location.assign("/new");
  }

  let cardSprites = addPlayerHandSprites(game);
  let opponentBackOfCardSprites = (0, _sprites._generateOpponentCardSprites)(game);
  setUpOpponentBackOfCards(opponentBackOfCardSprites);

  function addPlayerHandSprites(game) {
    let cardSprites = (0, _sprites._generateCardSprites)(game);
    (0, _sprites.makeSpritesInteractive)(cardSprites, game);
    (0, _sprites._positionCardSprites)(cardSprites);
    (0, _sprites._scaleSpritesDownTo)(0.5, cardSprites);
    addCardSpritesToStage(cardSprites);
    return cardSprites;
  }

  const trumpCardSprite = game.gameType === _Constants.Constants.gameConstants.BRSICOLA_500 ? null : setUpTrumpCard(game.trumpCard);
  const backOfDeckSprite = setUpBackOfDeck();
  updateHorseKingButtons(game);

  _app.app.ticker.add(delta => gameLoop(delta));

  function removePlayerToActText(playerToActText) {
    playerToActText.parent.removeChild(playerToActText);
  }

  function removeDeckCountSprite(deckCountText) {
    deckCountText.parent.removeChild(deckCountText);
  }

  function setUpOpponentBackOfCards(opponentBackOfCardSprites) {
    for (let i = 0; i < opponentBackOfCardSprites.length; i++) {
      let backOfDeckSprite = opponentBackOfCardSprites[i];
      (0, _sprites._scaleSpriteDownTo)(0.5, backOfDeckSprite);
      addCardSpriteToStage(backOfDeckSprite);
    }

    (0, _sprites._positionOpponentBackCardSprites)(opponentBackOfCardSprites);
  }

  function addPileCard(pileCard) {
    let pileCardSprite = (0, _sprites._generateCardSprite)(`../images/${pileCard.rank + pileCard.suit}.png`);
    middlePileCardSprites.push(pileCardSprite);
    (0, _sprites._positionPileCard)(pileCardSprite);
    (0, _sprites._scaleSpriteDownTo)(0.5, pileCardSprite);
    addCardSpriteToStage(pileCardSprite);
  }

  function setUpTrumpCard(trumpCard) {
    let trumpCardSprite = (0, _sprites._generateCardSprite)(`../images/${trumpCard.rank + trumpCard.suit}.png`);
    (0, _sprites._positionTrumpCard)(trumpCardSprite);
    (0, _sprites._scaleSpriteDownTo)(0.5, trumpCardSprite);
    addCardSpriteToStage(trumpCardSprite);
    return trumpCardSprite;
  }

  function setUpBackOfDeck() {
    let backOfDeckSprite = (0, _sprites._generateCardSprite)(`../images/backOfCard.png`);
    (0, _sprites._positionBackOfCard)(backOfDeckSprite);
    (0, _sprites._scaleSpriteDownTo)(0.5, backOfDeckSprite);
    addCardSpriteToStage(backOfDeckSprite);
    return backOfDeckSprite;
  }

  function addCardSpriteToStage(cardSprite) {
    _app.app.stage.addChild(cardSprite);
  }

  function addCardSpritesToStage(cardSprites) {
    cardSprites.forEach(cardSprite => {
      addCardSpriteToStage(cardSprite);
    });
  }

  function removeAllSpritesOnScreen() {
    _app.app.stage.children.forEach(childSprite => {
      _app.app.stage.removeChild(childSprite);
    });
  }

  function findHorseKingSuits(hand) {
    const suitRanks = {};

    for (const card of hand.cards) {
      if (card.rank === HORSE_RANK || card.rank === KING_RANK) {
        if (!suitRanks[card.suit]) suitRanks[card.suit] = new Set();
        suitRanks[card.suit].add(card.rank);
      }
    }

    return Object.keys(suitRanks).filter(suit => suitRanks[suit].has(HORSE_RANK) && suitRanks[suit].has(KING_RANK));
  }

  function countHandPoints(hand) {
    if (!hand || !hand.cards) return 0;
    return hand.cards.reduce((sum, card) => {
      const points = _Constants.Constants.gameConstants.MAP_RANK_TO_NUMBER_OF_POINTS[card.rank] || 0;
      return sum + (points > 0 ? points : 0);
    }, 0);
  }

  function isFirstRound(game) {
    return game.players.every(p => !p.pile || !p.pile.cards || p.pile.cards.length === 0);
  }

  function callBriskButton(suitAbbr, index, enabled) {
    const suitName = _Constants.Constants.gameConstants.MAP_ABBREVIATION_TO_SUITS[suitAbbr];
    const button = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.beginFill(enabled ? 0x4CAF50 : 0x9E9E9E);
    bg.drawRoundedRect(0, 0, 200, 36, 8);
    bg.endFill();
    button.addChild(bg);
    const text = new PIXI.Text(`Call Briscola of ${suitName}`, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xFFFFFF,
      align: 'center'
    });
    text.x = 10;
    text.y = 9;
    button.addChild(text);
    button.x = 0.05 * screenWidth;
    button.y = screenHeight - 260 + index * 45;
    button.interactive = enabled;
    button.buttonMode = enabled;
    button.on('pointerdown', () => {
      (0, _eventHandlers.callBrisk)(suitAbbr);
    });
    return button;
  }

  function createMisdealButton(index, enabled) {
    const button = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.beginFill(enabled ? 0xFF5722 : 0x9E9E9E);
    bg.drawRoundedRect(0, 0, 200, 36, 8);
    bg.endFill();
    button.addChild(bg);
    const text = new PIXI.Text('Misdeal', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xFFFFFF,
      align: 'center'
    });
    text.x = 10;
    text.y = 9;
    button.addChild(text);
    button.x = 0.05 * screenWidth;
    button.y = screenHeight - 260 + index * 45;
    button.interactive = enabled;
    button.buttonMode = enabled;
    button.on('pointerdown', () => {
      (0, _eventHandlers.requestMisdeal)();
    });
    return button;
  }

  function updateHorseKingButtons(game) {
    for (const btn of horseKingButtons) {
      if (btn.parent) btn.parent.removeChild(btn);
    }

    if (misdealButtonSprite && misdealButtonSprite.parent) {
      misdealButtonSprite.parent.removeChild(misdealButtonSprite);
      misdealButtonSprite = null;
    }

    let nextButtonIndex = 0;

    if (game.gameType === _Constants.Constants.gameConstants.BRSICOLA_500 && game.trumpSuit == null) {
      horseKingButtons = [];
      const hand = game.playerForClientSide.hand;
      const matchingSuits = findHorseKingSuits(hand);
      const myTurn = (0, _generators.isMyTurnToAct)(game);
      matchingSuits.forEach(suit => {
        const button = callBriskButton(suit, nextButtonIndex, myTurn);

        _app.app.stage.addChild(button);

        horseKingButtons.push(button);
        nextButtonIndex++;
      });
    }

    if (isFirstRound(game)) {
      const hand = game.playerForClientSide.hand;
      const handPoints = countHandPoints(hand);

      if (handPoints < 5) {
        const myTurn = (0, _generators.isMyTurnToAct)(game);
        misdealButtonSprite = createMisdealButton(nextButtonIndex, myTurn);

        _app.app.stage.addChild(misdealButtonSprite);
      }
    }
  }
}

function gameLoop(delta) {
  (0, _scaleWindow.scaleToWindow)(_app.app.renderer.view);
}