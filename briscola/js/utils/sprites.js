import {_onCardPress} from '../eventHandlers.js'
import { Constants } from '../Constants.js';
import {
  getOpponentPlayer
} from './general.js'

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

/* ─── Card shadow helper ─── */
function _addCardShadow(sprite) {
  const shadow = new PIXI.Graphics();
  const w = sprite.width || 90;
  const h = sprite.height || 130;
  shadow.beginFill(0x000000, 0.35);
  shadow.drawRoundedRect(4, 6, w, h, 6);
  shadow.endFill();
  shadow.filters = [new PIXI.filters.BlurFilter(6)];
  if (sprite.parent) {
    const idx = sprite.parent.getChildIndex(sprite);
    sprite.parent.addChildAt(shadow, idx);
    shadow.x = sprite.x;
    shadow.y = sprite.y;
  }
  sprite._shadowGraphic = shadow;
}

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
      sprite.buttonMode = true
      sprite.tap = (arg) => _onCardPress(arg, game)
      sprite.click = (arg) => _onCardPress(arg, game)
      // Hover lift effect
      sprite._origY = sprite.y;
      sprite.on('pointerover', () => {
        sprite.y = (sprite._origY || sprite.y) - 14;
        sprite.alpha = 1;
      });
      sprite.on('pointerout', () => {
        sprite.y = sprite._origY || sprite.y;
        sprite.alpha = 0.95;
      });
      sprite.alpha = 0.95;
    })
}

export function _positionCardSprite(cardSprite, x, y)
{
  cardSprite.x = x
  cardSprite.y = y
}
export function _positionOpponentBackCardSprites(backOfCardSprites)
{
  const totalCards = backOfCardSprites.length;
  const spacing = 80;
  const totalWidth = (totalCards - 1) * spacing;
  const startX = (screenWidth / 2) - (totalWidth / 2);
  backOfCardSprites.forEach((backOfCardSprite, i) =>{
    _positionCardSprite(backOfCardSprite, startX + spacing * i, 10)
  })
}
export function _positionBackOfCard(backOfCardSprite)
{
    _positionCardSprite(backOfCardSprite, screenWidth - 260, screenHeight / 2 - 100)
}
export function _positionPileCard(pileCardSprite)
{
    const randomDisplacement = 120 * Math.random();
    _positionCardSprite(pileCardSprite, (screenWidth / 2 - 100) + randomDisplacement, screenHeight / 2 - 20)
    pileCardSprite.anchor.x = 0.5
    pileCardSprite.anchor.y = 0.5
    pileCardSprite.rotation = (Math.random() - 0.5) * 0.35
}
export function _positionBriskCalledSprite(pileCardSprite, spriteIndex)
{
  const displacement = spriteIndex * 120;
  _positionCardSprite(pileCardSprite, (screenWidth / 2 - 60) + displacement, screenHeight / 2 + 20)
  pileCardSprite.anchor.x = 0.5
  pileCardSprite.anchor.y = 0.5
}
export function _positionBriskCalledText(pileCardSprite)
{
  _positionCardSprite(pileCardSprite, screenWidth / 2, screenHeight / 2 + 150)
  pileCardSprite.anchor.x = 0.5
  pileCardSprite.anchor.y = 0.5
}
export function _positionTrumpCard(trumpCardSprite)
{
  _positionCardSprite(trumpCardSprite, screenWidth - 260, screenHeight / 2 - 100)
  trumpCardSprite.anchor.x = 0.5
  trumpCardSprite.anchor.y = 0.5
  trumpCardSprite.rotation = Math.PI / 2
}
//for hand – centered fan layout
export function _positionCardSprites(cardSprites)
{
  const totalCards = cardSprites.length;
  const spacing = 110;
  const totalWidth = (totalCards - 1) * spacing;
  const startX = (screenWidth / 2) - (totalWidth / 2);
  cardSprites.forEach((cardSprite, i) => {
    const x = startX + spacing * i;
    const y = screenHeight - 200;
    _positionCardSprite(cardSprite, x, y);
    cardSprite._origY = y;
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