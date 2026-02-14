import {_onCardPress} from '../eventHandlers.js'
import { Constants } from '../Constants.js';
import {
  getOpponentPlayer
} from './general.js'

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

export  function _scaleSpriteDownTo(percent, sprite)
{
  sprite.scale.set(percent)
}
export  function _scaleSpritesDownTo(percent, sprites)
{
  sprites.forEach(sprite => _scaleSpriteDownTo(percent, sprite))
}
export function makeSpritesInteractive(sprites, game)
{
  sprites.forEach(sprite =>
    {
      sprite.interactive = true
      sprite.tap = (arg) => _onCardPress(arg, game)
      sprite.click = (arg) => _onCardPress(arg, game)
    })
}

export function _positionCardSprite(cardSprite, x, y)
{
  cardSprite.x = x
  cardSprite.y = y
}
export function _positionOpponentBackCardSprites(backOfCardSprites)
{
  backOfCardSprites.forEach((backOfCardSprite, i) =>{
    _positionCardSprite(backOfCardSprite, screenWidth / 4 + 100*i, 0)
  })
}
export function _positionBackOfCard(backOfCardSprite)
{
    _positionCardSprite(backOfCardSprite, screenWidth - 300, screenHeight / 2 - 100)
}
export function _positionPileCard(pileCardSprite)
{
    const randomDisplacement = 185 * Math.random(); 
    _positionCardSprite(pileCardSprite, (screenWidth / 2 - 200) + randomDisplacement, screenHeight / 2)
    pileCardSprite.anchor.x = 0.5
    pileCardSprite.anchor.y = 0.5
    pileCardSprite.rotation = Math.random()/2
}
export function _positionTrumpCard(trumpCardSprite)
{
  _positionCardSprite(trumpCardSprite, screenWidth - 300, screenHeight / 2 - 100)
  trumpCardSprite.anchor.x = 0.5
  trumpCardSprite.anchor.y = 0.5
  trumpCardSprite.rotation = Math.PI /2
}
//for hand
export function _positionCardSprites(cardSprites)
{
  cardSprites.forEach((cardSprite, i) => {
    _positionCardSprite(cardSprite, screenWidth / 4 + 100*i, screenHeight - 200)
  })
}

export function _generateOpponentCardSprites(game)
{
  const opponentPlayer = getOpponentPlayer(game);
  let cardSprites = []
  for (let i = 0; i<opponentPlayer.hand.cards.length; i++)
  {
    let cardSprite = new PIXI.Sprite(
      PIXI.loader.resources[`../images/backOfCard.png`].texture
    );
    cardSprites.push(cardSprite)
  }
  return cardSprites
}
export function _generateCardSprites(game)
{
  const hand = game.playerForClientSide.hand
  console.log(hand)
  let cardSprites = []
  for (let i = 0; i<hand.cards.length; i++)
  {
    let cardSprite = new PIXI.Sprite(
      PIXI.loader.resources[`../images/${hand.cards[i].rank + hand.cards[i].suit}.png`].texture
    );
    cardSprite.card = hand.cards[i]
    cardSprites.push(cardSprite)
  }
  return cardSprites
}

export function _generateCardSprite(path)
{
  let cardSprite = new PIXI.Sprite(
    PIXI.loader.resources[path].texture
  );
  return cardSprite
}

export function _removeSprite(sprite)
{
  if(sprite.parent && sprite.parent.removeChild)
  {
    sprite.parent.removeChild(sprite)
  }
}
export function _removeSprites(sprites)
{
  sprites.forEach((sprite)=>{
    _removeSprite(sprite)
  })
}
export function removeMiddlePileCardSprites(middlePileCardSprites)
{
  // remove only the last 2 cards
  _removeSprites(middlePileCardSprites.slice(0, Constants.gameConstants.NUMBER_OF_PLAYERS))
}
export function removeHandCardSprites(handCardSprites)
{
  _removeSprites(handCardSprites)
}