"use strict";
import { app } from './index.js'
import { Deck } from './Deck.js'
import { Card } from './Card.js'
import { Hand } from './Hand.js'
import { Player } from './Player.js'
import { Constants } from './Constants.js'
import { scaleToWindow } from './utils/scaleWindow.js'

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
  this.trumpCard = this.drawCard()


}

function start()
{
  let game = new Game();
  let hand = game.player1.hand;

  let cardSprites = _generateCardSprites(hand)
  _positionCardSprites(cardSprites)
  _rotateCardSprites(cardSprites)
  _scaleSpritesDownTo(0.5, cardSprites)
  addCardSpritesToStage(cardSprites)

  setUpTrumpCard()
  setUpBackOfDeck()

  let opponentBackOfCardSprites = _generateOpponentCardSprites();
  setUpOpponentBackOfCards(opponentBackOfCardSprites)

  app.ticker.add(delta => gameLoop(delta));

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
function setUpTrumpCard(){
  let trumpCardSprite = _generateCardSprite(`../images/${game.trumpCard.rank + game.trumpCard.suit}.png`)
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
    cardSprites.push(cardSprite)
  }
  return cardSprites
}
//for back of card
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
