"use strict";
import { app } from './appAgainstComputer.js'
import { Constants } from './Constants.js'
import {Game} from './Game.js'
import { scaleToWindow } from './utils/scaleWindow.js'

const PLAY_CARD_SOUND = new Howl({ src:[Constants.soundUrl.PLAY_CARD] });
const SHUFFLE_CARDS_SOUND = new Howl({ src:[Constants.soundUrl.SHUFFLE_CARDS] });


let game;

async function start()
{
  game = Game()
  game.init()
  //game starts after this point
  SHUFFLE_CARDS_SOUND.play()

  //Add the canvas that Pixi automatically created for you to the HTML document
  document.body.appendChild(app.view);
  
  let playerToActText = generatePlayerToActText(game)
  app.stage.addChild(playerToActText)
  let middlePileCardSprites = []


  let cardSprites = addPlayerHandSprites(game.player1)
  function addPlayerHandSprites(player)
  {
    let cardSprites = _generateCardSprites(player.hand)
    makeSpritesInteractive(cardSprites, game)
    _positionCardSprites(cardSprites)
    _rotateCardSprites(cardSprites)
    _scaleSpritesDownTo(0.5, cardSprites)
    addCardSpritesToStage(cardSprites)
    return cardSprites
  }
 
  const trumpCardSprite = setUpTrumpCard(game.trumpCard)
  const backOfDeckSprite = setUpBackOfDeck()

  let opponentBackOfCardSprites = _generateOpponentCardSprites();
  setUpOpponentBackOfCards(opponentBackOfCardSprites)

  app.ticker.add(delta => gameLoop(delta));

function removePlayerToActText(playerToActText)
{
  playerToActText.parent.removeChild(playerToActText)
}
function generatePlayerToActText(game)
{
  const playerMoveTextStyle = {fontFamily : 'Arial', fontSize: 24, align : 'center'}

  let playerToActText;
  if(isMyTurnToAct(game))
  {
    playerToActText = new PIXI.Text('Your move', playerMoveTextStyle);
  }
  else
  {
    playerToActText = new PIXI.Text("Opponent's move", playerMoveTextStyle);
  }
  playerToActText.x = 0.05*Constants.width;
  playerToActText.y = Constants.height - 135;

  return  playerToActText
}
function isMyTurnToAct(game)
{
  return game.currentPlayerToActByIndex === 0
}
function getMyPlayerObject(game)
{
 return game.player1
}

function getOpponentPlayer(game)
{
 return game.player2
}
function _onCardPress(arg, game)
{
  const cardPressed = arg.currentTarget.card
    const cardSprite = arg.target
  if(isMyTurnToAct(game))
  {
    PLAY_CARD_SOUND.play()
    addPileCard(cardPressed)
    removePlayerToActText(playerToActText)
    playerToActText = generatePlayerToActText(game)
    app.stage.addChild(playerToActText)
    cardSprite.parent.removeChild(cardSprite)

    if(game.isRoundOver())
    {

    }
    else {
      //computer still has to play
      computerTurn()
      //now the round is over
      roundOver()
      setTimeout( ()=> {
  
        removeMiddlePileCardSprites(middlePileCardSprites)
        
      }, 3000)
    }
  }
  else{console.error("Cannot play your card, it is not your turn");}
}
function roundOver()
{
  let winningPlayer = game.getWinningPlayer()
        let winningPlayerIndex =  game.getWinningPlayerIndex()
        game.currentPlayerToActByIndex = winningPlayerIndex
        game.firstPlayerToActByIndex = game.currentPlayerToActByIndex;
        winningPlayer.pile.addCards(game.middlePile.cards)
        
        if(game.isLastDeal())
        {
           // emitEvent(game, Constants.events.LAST_DEAL)//should be a condition to only send this event once
        }
        if(!game.isDeckEmpty())
        {
            game.dealNextCardToAllPlayers()
        }

        game.middlePile.reset()//reset only after dealing the next cards
        if(game.isGameOver())
        {
            game.players[0].points = game.players[0].pile.countPoints()
            game.players[1].points = game.players[1].pile.countPoints()
            //emitGameOver(game)
        }
        
        //emitEvent(game, Constants.events.ROUND_OVER, winningPlayer)
}
function computerTurn()
{
  const playedCard = game.computerMove()
  addPileCard(playedCard)
}
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
    middlePileCardSprites.push(pileCardSprite)
    _positionPileCard(pileCardSprite)
    _scaleSpriteDownTo(0.5, pileCardSprite)
    addCardSpriteToStage(pileCardSprite)
}
function setUpTrumpCard(trumpCard){
  let trumpCardSprite = _generateCardSprite(`../images/${trumpCard.rank + trumpCard.suit}.png`)
  _positionTrumpCard(trumpCardSprite)
  _scaleSpriteDownTo(0.5, trumpCardSprite)
  addCardSpriteToStage(trumpCardSprite)
  return trumpCardSprite
}
function setUpBackOfDeck()
{
  let backOfDeckSprite = _generateCardSprite(`../images/backOfCard.png`)
  _positionBackOfCard(backOfDeckSprite)
  _scaleSpriteDownTo(0.5, backOfDeckSprite)
  addCardSpriteToStage(backOfDeckSprite)
  return backOfDeckSprite
}
function _removeSprite(sprite)
{
  if(sprite.parent && sprite.parent.removeChild)
  {
    sprite.parent.removeChild(sprite)
  }
}
function _removeSprites(sprites)
{
  sprites.forEach((sprite)=>{
    _removeSprite(sprite)
  })
}
function removeMiddlePileCardSprites(middlePileCardSprites)
{
  // remove only the last 2 cards
  _removeSprites(middlePileCardSprites.slice(0, Constants.gameConstants.NUMBER_OF_PLAYERS))
}
function removeHandCardSprites(handCardSprites)
{
  _removeSprites(handCardSprites)
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
    _positionCardSprite(backOfCardSprite, Constants.width / 2, Constants.height / 2 - 100)
}
function _positionPileCard(pileCardSprite)
{
    _positionCardSprite(pileCardSprite, (Constants.width / 2 - 200 + 100* Math.random()), Constants.height / 2 + 100* Math.random())
    pileCardSprite.anchor.x = 0.5
    pileCardSprite.anchor.y = 0.5
    pileCardSprite.rotation = Math.random()/2
}
function _positionTrumpCard(trumpCardSprite)
{
  _positionCardSprite(trumpCardSprite, Constants.width / 2, Constants.height / 2 - 100)
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
    if(leftCard)
    {
      leftCard.rotation = -0.2 * factor
      leftCard.y = leftCard.y - displacement * factor
    }
    if(middleCard)
    {
      middleCard.y =  middleCard.y - 2*(displacement * factor)
    }
    if(rightCard)
    {
      rightCard.y = rightCard.y - displacement * factor
      rightCard.rotation = 0.2 *factor
    }

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
  function removeAllSpritesOnScreen()
  {
    app.stage.children.forEach((childSprite)=>{
      if(childSprite.parent && childSprite.parent.removeChild)
      {
        childSprite.parent.removeChild(childSprite)
      }
    })
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
