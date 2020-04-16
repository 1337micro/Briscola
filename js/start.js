"use strict";
import { app } from './app.js'
import { Constants } from './Constants.js'
import { _onCardPress, getGame, gameStart, requestGameStart, onGameUpdate, onCardPlayed, onRoundOver, onLastDeal, onGameOver } from './eventHandlers.js'
import { scaleToWindow } from './utils/scaleWindow.js'

let game;

async function start()
{
  const awaitingOpponentTextStyle = {fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'}
  let awaitingOpponentText = new PIXI.Text("Waiting for opponent... Please be patient.", awaitingOpponentTextStyle)
  app.stage.addChild(awaitingOpponentText)
  requestGameStart();
  game = await getGame();
  await gameStart();
  if(awaitingOpponentText.parent && awaitingOpponentText.parent.removeChild)
  {
    awaitingOpponentText.parent.removeChild(awaitingOpponentText)
  }
  let playerToActText = generatePlayerToActText(game)
  app.stage.addChild(playerToActText)

  let middlePileCardSprites = []
  onGameUpdate((newGameObj)=>
  {
      game = newGameObj     
      removeHandCardSprites(cardSprites)
      cardSprites = addPlayerHandSprites(game.playerForClientSide)

      removePlayerToActText(playerToActText)
      playerToActText = generatePlayerToActText(game)
      app.stage.addChild(playerToActText)
  })
  onCardPlayed((cardPlayed)=>
  {
    //add the card to the middlePile
      addPileCard(cardPlayed)
      removePlayerToActText(playerToActText)
      playerToActText = generatePlayerToActText(game)
      app.stage.addChild(playerToActText)
  })
  onRoundOver((winningPlayer)=>
  {
    function removePileCards()
    {
      removeMiddlePileCardSprites(middlePileCardSprites)
      if(middlePileCardSprites.length > Constants.gameConstants.NUMBER_OF_PLAYERS)
      {
        middlePileCardSprites = middlePileCardSprites.slice(Constants.gameConstants.NUMBER_OF_PLAYERS);
      }
      else if(middlePileCardSprites.length === Constants.gameConstants.NUMBER_OF_PLAYERS)
      {
        middlePileCardSprites.length = 0;
      }
    }
    setTimeout(removePileCards, 1000)
  })
  onLastDeal(()=>{
    if(trumpCardSprite)
    {
      _removeSprite(trumpCardSprite)
    }
    if(backOfDeckSprite)
    {
      _removeSprite(backOfDeckSprite)
    }
  })
  onGameOver((game)=>{
    //remove all elements
    app.stage.children.forEach((childSprite)=>{
      if(childSprite.parent && childSprite.parent.removeChild)
      {
        childSprite.parent.removeChild(childSprite)
      }
    })
    let textFontSize = 24
    let textPositionX = 0
    let textPositionY = Constants.height/2;

    const gameOverStyle = {fontFamily : 'Arial', fontSize: textFontSize, fill : 0xff1010, align : 'center'}
    const gameOverText = new PIXI.Text('Game over.', gameOverStyle);
    gameOverText.x = textPositionX
    gameOverText.y = textPositionY
    textPositionY = textPositionY + textFontSize + 5;
    const myPlayerObject = getMyPlayerObject(game);
    const opponentPlayer = getOpponentPlayer(game);

    const pointsText = new PIXI.Text('Your points: ' +myPlayerObject.points + ', Opponent points: ' + opponentPlayer.points, gameOverStyle);
    pointsText.x = textPositionX
    pointsText.y = textPositionY
    textPositionY = textPositionY + textFontSize + 5;
    let winningText;
    if(myPlayerObject.points>opponentPlayer.points)
    {
      //I win
      winningText = new PIXI.Text("You win.", gameOverStyle)
    }
    else
    {
      winningText = new PIXI.Text("Opponent wins.", gameOverStyle)
    }

    winningText.x = textPositionX
    winningText.y = textPositionY
    textPositionY = textPositionY + textFontSize + 5;
    const refreshPageForNewGame = new PIXI.Text('Refresh page for new game', gameOverStyle);
    refreshPageForNewGame.x = textPositionX
    refreshPageForNewGame.y = textPositionY
    textPositionY = textPositionY + textFontSize + 5;
    app.stage.addChild(gameOverText)
    app.stage.addChild(pointsText)
    app.stage.addChild(winningText)
    app.stage.addChild(refreshPageForNewGame)
  })
  

  //let trumpCard = await getTrumpCard()
  let cardSprites =addPlayerHandSprites(game.playerForClientSide)
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
  const playerMoveTextStyle = {fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'}

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
  playerToActText.y = Constants.height - 100;

  return  playerToActText
}
function isMyTurnToAct(game)
{
  const playerToAct = game.players[game.currentPlayerToActByIndex]
  const myPlayerObject = game.playerForClientSide
  return playerToAct && myPlayerObject && playerToAct.socketId === myPlayerObject.socketId
}
function getMyPlayerObject(game)
{
  const myPlayerObject = game.playerForClientSide
  if(game.players[0].socketId === myPlayerObject.socketId)
  {
    return game.players[0]
  }
  else return game.players[1]
}

function getOpponentPlayer(game)
{
  const myPlayerObject = game.playerForClientSide
  if(game.players[0].socketId === myPlayerObject.socketId)
  {
    return game.players[1]
  }
  else return game.players[0]
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
    _positionCardSprite(backOfCardSprite, Constants.width / 2, Constants.height / 2)
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

function gameLoop(delta)
{
 scaleToWindow(app.renderer.view)
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
}
export { start };
