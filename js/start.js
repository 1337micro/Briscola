"use strict";
import { app } from './app.js'
import { Constants } from './Constants.js'
import { _onCardPress, getGame, requestGameStart, onGameUpdate, onCardPlayed } from './eventHandlers.js'
import { scaleToWindow } from './utils/scaleWindow.js'

let game;

async function start()
{
  //let opponent = await awaitOpponent()
  requestGameStart();
  game = await getGame();
  onGameUpdate((newGameObj)=>
  {
      game = newGameObj
  })
  onCardPlayed((cardPlayed)=>
  {
    //add the card to the middlePile
      addPileCard(cardPlayed)
  })
  const player = game.playerForClientSide
  const trumpCard = game.trumpCard
  //let trumpCard = await getTrumpCard()


  let cardSprites = _generateCardSprites(player.hand)
  makeSpritesInteractive(cardSprites, game);
  _positionCardSprites(cardSprites)
  _rotateCardSprites(cardSprites)
  _scaleSpritesDownTo(0.5, cardSprites)
  addCardSpritesToStage(cardSprites)

  setUpTrumpCard(trumpCard)
  setUpBackOfDeck()

  let opponentBackOfCardSprites = _generateOpponentCardSprites();
  setUpOpponentBackOfCards(opponentBackOfCardSprites)

  app.ticker.add(delta => gameLoop(delta));

function makeSpritesInteractive(sprites, game)
{
  sprites.forEach(sprite =>
    {
      sprite.interactive = true
      sprite.tap = (arg) => _onCardPress(arg, game)
      sprite.click = (arg) => _onCardPress(arg, game)
    })
}

function setUpOpponentBackOfCards(opponentBackOfCardSprites)
{
  for (let i = 0; i<3; i++)
  {
    let backOfDeckSprite = opponentBackOfCardSprites[i]
    _scaleSpriteDownTo(0.5, backOfDeckSprite)
    addCardSpriteToStage(backOfDeckSprite)
  }
  _positionOpponentBackCardSprites(opponentBackOfCardSprites)
}
function addPileCard(pileCard)
{
    let pileCardSprite = _generateCardSprite(`../images/${pileCard.rank + pileCard.suit}.png`)
    _positionPileCard(pileCardSprite)
    _scaleSpriteDownTo(0.5, pileCardSprite)
    addCardSpriteToStage(pileCardSprite)
}
function setUpTrumpCard(trumpCard){
  let trumpCardSprite = _generateCardSprite(`../images/${trumpCard.rank + trumpCard.suit}.png`)
  _positionTrumpCard(trumpCardSprite)
  _scaleSpriteDownTo(0.5, trumpCardSprite)
  addCardSpriteToStage(trumpCardSprite)
}
function setUpBackOfDeck()
{
  let backOfDeckSprite = _generateCardSprite(`../images/backOfCard.png`)
  _positionBackOfCard(backOfDeckSprite)
  _scaleSpriteDownTo(0.5, backOfDeckSprite)
  addCardSpriteToStage(backOfDeckSprite)
}
function _generateOpponentCardSprites()
{
  let cardSprites = []
  for (let i = 0; i<3; i++)
  {
    let cardSprite = new PIXI.Sprite(
      PIXI.loader.resources[`../images/backOfCard.png`].texture
    );
    cardSprites.push(cardSprite)
  }
  return cardSprites
}
function _generateCardSprites(hand)
{
  let cardSprites = []
  for (let i = 0; i<3; i++)
  {
    let cardSprite = new PIXI.Sprite(
      PIXI.loader.resources[`../images/${hand.cards[i].rank + hand.cards[i].suit}.png`].texture
    );
    cardSprite.card = hand.cards[i]
    cardSprites.push(cardSprite)
  }
  return cardSprites
}

function _positionCardSprite(cardSprite, x, y)
{
  cardSprite.x = x
  cardSprite.y = y
}
function _positionOpponentBackCardSprites(backOfCardSprites)
{
  backOfCardSprites.forEach((backOfCardSprite, i) =>{
    _positionCardSprite(backOfCardSprite, Constants.width / 4 + 100*i, 0)
  })
  _rotateCardSprites(backOfCardSprites, false)
}
function _positionBackOfCard(backOfCardSprite)
{
    _positionCardSprite(backOfCardSprite, Constants.width / 2, Constants.height / 2)
}
function _positionPileCard(pileCardSprite)
{
    _positionCardSprite(pileCardSprite, (Constants.width / 2 - 100* Math.random()), Constants.height / 2 - 100* Math.random())
    pileCardSprite.anchor.x = 0.5
    pileCardSprite.anchor.y = 0.5
    pileCardSprite.rotation = Math.random()/2
}
function _positionTrumpCard(trumpCardSprite)
{
  _positionCardSprite(trumpCardSprite, Constants.width / 2, Constants.height / 2)
  trumpCardSprite.anchor.x = 0.5
  trumpCardSprite.anchor.y = 0.5
  trumpCardSprite.rotation = Math.PI /2
}
//for hand
function _positionCardSprites(cardSprites)
{
  cardSprites.forEach((cardSprite, i) => {
    _positionCardSprite(cardSprite, Constants.width / 4 + 100*i, Constants.height)
  })
}
  function _rotateCardSprites(cardSprites, yourHand = true)
  {
    cardSprites.forEach((cardSprite) =>{
      cardSprite.anchor.x = 0.5
      cardSprite.anchor.y = 0.5
    })
    let factor = yourHand ? 1 : -1;
    let displacement = 15
    let leftCard = cardSprites[0]
    let middleCard = cardSprites[1]
    let rightCard = cardSprites[2]
    leftCard.rotation = -0.2 * factor
    leftCard.y = leftCard.y - displacement * factor
    middleCard.y =  middleCard.y - 2*(displacement * factor)
    rightCard.y = rightCard.y - displacement * factor
    rightCard.rotation = 0.2 *factor
  }
  function _scaleSpriteDownTo(percent, sprite)
  {
    sprite.scale.set(percent)
  }
  function _scaleSpritesDownTo(percent, sprites)
  {
    sprites.forEach(sprite => _scaleSpriteDownTo(percent, sprite))
  }
  function addCardSpriteToStage(cardSprite)
  {
    app.stage.addChild(cardSprite);
  }
  function addCardSpritesToStage(cardSprites)
  {
    cardSprites.forEach(cardSprite => {
      addCardSpriteToStage(cardSprite);
    })
  }

  function _generateCardSprite(path)
  {
    let cardSprite = new PIXI.Sprite(
      PIXI.loader.resources[path].texture
    );
    return cardSprite
  }
}

function gameLoop(delta)
{
 scaleToWindow(app.renderer.view)
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
}
export { start };
