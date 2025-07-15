"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._rotateCardSprites = _rotateCardSprites;
exports._scaleSpriteDownTo = _scaleSpriteDownTo;
exports._scaleSpritesDownTo = _scaleSpritesDownTo;
exports.makeSpritesInteractive = makeSpritesInteractive;
exports._positionCardSprite = _positionCardSprite;
exports._positionOpponentBackCardSprites = _positionOpponentBackCardSprites;
exports._positionBackOfCard = _positionBackOfCard;
exports._positionPileCard = _positionPileCard;
exports._positionTrumpCard = _positionTrumpCard;
exports._positionCardSprites = _positionCardSprites;
exports._generateOpponentCardSprites = _generateOpponentCardSprites;
exports._generateCardSprites = _generateCardSprites;
exports._generateCardSprite = _generateCardSprite;
exports._removeSprite = _removeSprite;
exports._removeSprites = _removeSprites;
exports.removeMiddlePileCardSprites = removeMiddlePileCardSprites;
exports.removeHandCardSprites = removeHandCardSprites;

var _eventHandlers = require("../eventHandlers.js");

var _Constants = require("../Constants.js");

var _general = require("./general.js");

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

function _rotateCardSprites(cardSprites, yourHand = true) {
  cardSprites.forEach(cardSprite => {
    cardSprite.anchor.x = 0.5;
    cardSprite.anchor.y = 0.5;
  });
  let factor = yourHand ? 1 : -1;
  let displacement = 15;
  let leftCard = cardSprites[0];
  let middleCard = cardSprites[1];
  let rightCard = cardSprites[2];

  if (leftCard) {
    leftCard.rotation = -0.2 * factor;
    leftCard.y = leftCard.y - displacement * factor;
  }

  if (middleCard) {
    middleCard.y = middleCard.y - 2 * (displacement * factor);
  }

  if (rightCard) {
    rightCard.y = rightCard.y - displacement * factor;
    rightCard.rotation = 0.2 * factor;
  }
}

function _scaleSpriteDownTo(percent, sprite) {
  sprite.scale.set(percent);
}

function _scaleSpritesDownTo(percent, sprites) {
  sprites.forEach(sprite => _scaleSpriteDownTo(percent, sprite));
}

function makeSpritesInteractive(sprites, game) {
  sprites.forEach(sprite => {
    sprite.interactive = true;

    sprite.tap = arg => (0, _eventHandlers._onCardPress)(arg, game);

    sprite.click = arg => (0, _eventHandlers._onCardPress)(arg, game);
  });
}

function _positionCardSprite(cardSprite, x, y) {
  cardSprite.x = x;
  cardSprite.y = y;
}

function _positionOpponentBackCardSprites(backOfCardSprites) {
  backOfCardSprites.forEach((backOfCardSprite, i) => {
    _positionCardSprite(backOfCardSprite, screenWidth / 4 + 100 * i, 0);
  });

  _rotateCardSprites(backOfCardSprites, false);
}

function _positionBackOfCard(backOfCardSprite) {
  _positionCardSprite(backOfCardSprite, screenWidth - 300, screenHeight / 2 - 100);
}

function _positionPileCard(pileCardSprite) {
  const randomDisplacement = 185 * Math.random();

  _positionCardSprite(pileCardSprite, screenWidth / 2 - 200 + randomDisplacement, screenHeight / 2);

  pileCardSprite.anchor.x = 0.5;
  pileCardSprite.anchor.y = 0.5;
  pileCardSprite.rotation = Math.random() / 2;
}

function _positionTrumpCard(trumpCardSprite) {
  _positionCardSprite(trumpCardSprite, screenWidth - 300, screenHeight / 2 - 100);

  trumpCardSprite.anchor.x = 0.5;
  trumpCardSprite.anchor.y = 0.5;
  trumpCardSprite.rotation = Math.PI / 2;
} //for hand


function _positionCardSprites(cardSprites) {
  cardSprites.forEach((cardSprite, i) => {
    _positionCardSprite(cardSprite, screenWidth / 4 + 100 * i, screenHeight - 100);
  });
}

function _generateOpponentCardSprites(game) {
  const opponentPlayer = (0, _general.getOpponentPlayer)(game);
  let cardSprites = [];

  for (let i = 0; i < opponentPlayer.hand.cards.length; i++) {
    let cardSprite = new PIXI.Sprite(PIXI.loader.resources[`../images/backOfCard.png`].texture);
    cardSprites.push(cardSprite);
  }

  return cardSprites;
}

function _generateCardSprites(hand) {
  let cardSprites = [];

  for (let i = 0; i < hand.cards.length; i++) {
    let cardSprite = new PIXI.Sprite(PIXI.loader.resources[`../images/${hand.cards[i].rank + hand.cards[i].suit}.png`].texture);
    cardSprite.card = hand.cards[i];
    cardSprites.push(cardSprite);
  }

  return cardSprites;
}

function _generateCardSprite(path) {
  let cardSprite = new PIXI.Sprite(PIXI.loader.resources[path].texture);
  return cardSprite;
}

function _removeSprite(sprite) {
  if (sprite.parent && sprite.parent.removeChild) {
    sprite.parent.removeChild(sprite);
  }
}

function _removeSprites(sprites) {
  sprites.forEach(sprite => {
    _removeSprite(sprite);
  });
}

function removeMiddlePileCardSprites(middlePileCardSprites) {
  // remove only the last 2 cards
  _removeSprites(middlePileCardSprites.slice(0, _Constants.Constants.gameConstants.NUMBER_OF_PLAYERS));
}

function removeHandCardSprites(handCardSprites) {
  _removeSprites(handCardSprites);
}