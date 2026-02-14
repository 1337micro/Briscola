"use strict";
import { app } from './app.js'
import { Constants } from './Constants.js'
import {
  _onCardPress,
  getGame,
  requestGameStart,
  requestSinglePlayerGameStart,
  onGameUpdate,
  onCardPlayed,
  onRoundOver,
  onLastDeal,
  onGameOver,
  onServerConnectionLost,
  onOpponentLeft,
  onRedirect,
  onComputerCardPlayed, 
  onFirstToActComputerCardPlayed
} from './eventHandlers.js'
import {
  _scaleSpriteDownTo,
  _scaleSpritesDownTo,
  makeSpritesInteractive,
  _positionCardSprite,
  _positionOpponentBackCardSprites,
  _positionBackOfCard,
  _positionPileCard,
  _positionTrumpCard,
  _positionCardSprites,
  _generateOpponentCardSprites,
  _generateCardSprites,
  _generateCardSprite,
  _removeSprite,
_removeSprites,
removeMiddlePileCardSprites,
removeHandCardSprites
} from './utils/sprites.js'
import {
  generatePlayerToActText, 
  generateYourPlayerNameText, 
  generateDeckCount, 
  generateTrumpSuitTextSprite
} from './utils/generators.js'
import {hideGreeting, isSinglePlayer, getLobbyName, getMyPlayerObject, getOpponentPlayer} from './utils/general.js'
import { scaleToWindow } from './utils/scaleWindow.js'

const PLAY_CARD_SOUND = new Howl({ src:[Constants.soundUrl.PLAY_CARD], volume: 0.35 });
const SHUFFLE_CARDS_SOUND = new Howl({ src:[Constants.soundUrl.SHUFFLE_CARDS], volume: 0.25 });

let game;
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
async function start()
{
  onRedirect((newUrl)=>{
    window.location.assign(newUrl)
  })

  isSinglePlayer() ? requestSinglePlayerGameStart() : requestGameStart(getLobbyName());
  game = await getGame().catch( (error)=> {
    console.error(error)
    redirectToNewGame()
  });

  //game starts after this point
  SHUFFLE_CARDS_SOUND.play()
  hideGreeting()
  //Add the canvas that Pixi automatically created for you to the HTML document
  document.body.appendChild(app.view);
  
  let playerToActText = generatePlayerToActText(game)
  app.stage.addChild(playerToActText)

  let yourNameText = generateYourPlayerNameText(game)
  app.stage.addChild(yourNameText)

  let deckCountText = generateDeckCount(game);
  let trumpSuitText = generateTrumpSuitTextSprite(game.trumpCard);
  app.stage.addChild(deckCountText)
  app.stage.addChild(trumpSuitText)

  let middlePileCardSprites = []
  onGameUpdate((newGameObj)=>
  {
      game = newGameObj     
      removeHandCardSprites(cardSprites)
      cardSprites = addPlayerHandSprites(game)
      
      removeHandCardSprites(opponentBackOfCardSprites)
      opponentBackOfCardSprites = _generateOpponentCardSprites(game)
      setUpOpponentBackOfCards(opponentBackOfCardSprites);

      removePlayerToActText(playerToActText)
      playerToActText = generatePlayerToActText(game)
      app.stage.addChild(playerToActText)

      removeDeckCountSprite(deckCountText)
      deckCountText = generateDeckCount(game);
      app.stage.addChild(deckCountText)

  })
  onCardPlayed((cardPlayed)=>
  {
    //add the card to the middlePile
      PLAY_CARD_SOUND.play()
      addPileCard(cardPlayed)
      removePlayerToActText(playerToActText)
      playerToActText = generatePlayerToActText(game)
      app.stage.addChild(playerToActText)
  })
  onComputerCardPlayed((cardPlayed)=>
  {
    setTimeout(()=>{
      //add the card to the middlePile
      PLAY_CARD_SOUND.play()
      addPileCard(cardPlayed)
      removePlayerToActText(playerToActText)
      playerToActText = generatePlayerToActText(game)
      app.stage.addChild(playerToActText)
    }, 1000)
  })
  onFirstToActComputerCardPlayed((cardPlayed)=>{
    setTimeout(()=>{
      //add the card to the middlePile
      PLAY_CARD_SOUND.play()
      addPileCard(cardPlayed)
      removePlayerToActText(playerToActText)
      playerToActText = generatePlayerToActText(game)
      app.stage.addChild(playerToActText)
    }, 2000)
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
    setTimeout(removePileCards, 3000)
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
    removeAllSpritesOnScreen()
    let textFontSize = 24
    let textPositionX = 0
    let textPositionY = screenHeight/2;

    const gameOverStyle = {fontFamily : 'Arial', fontSize: textFontSize, align : 'center'}
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
    else if(myPlayerObject.points === opponentPlayer.points)
    {
      winningText = new PIXI.Text("Tie game.", gameOverStyle)
    }
    else
    {
      winningText = new PIXI.Text("Opponent wins.", gameOverStyle)
    }

    winningText.x = textPositionX
    winningText.y = textPositionY
    app.stage.addChild(gameOverText)
    app.stage.addChild(pointsText)
    app.stage.addChild(winningText)
  })
  onServerConnectionLost((reason)=>{
    removeAllSpritesOnScreen()
    const gameOverStyle = {fontFamily : 'Arial', fontSize: 24, align : 'center'}
    const gameOverText = new PIXI.Text('Server connection lost. Game aborted. ', gameOverStyle);
    gameOverText.x = screenWidth/2
    gameOverText.y = screenHeight/2
    app.stage.addChild(gameOverText)
  })
  onOpponentLeft((reason)=>{
    removeAllSpritesOnScreen()
    const gameOverStyle = {fontFamily : 'Arial', fontSize: 24, align : 'center'}
    const gameOverText = new PIXI.Text('Opponent Left. Game aborted. ', gameOverStyle);
    gameOverText.x = screenWidth/2
    gameOverText.y = screenHeight/2
    app.stage.addChild(gameOverText)
  })
  function redirectToNewGame()
  {
    window.location.assign("/new")
  }

  let cardSprites = addPlayerHandSprites(game)
  let opponentBackOfCardSprites = _generateOpponentCardSprites(game);
  setUpOpponentBackOfCards(opponentBackOfCardSprites)

  function addPlayerHandSprites(game)
  {
    let cardSprites = _generateCardSprites(game)
    makeSpritesInteractive(cardSprites, game)
    _positionCardSprites(cardSprites)
    _scaleSpritesDownTo(0.5, cardSprites)
    addCardSpritesToStage(cardSprites)
    return cardSprites
  }
 
  const trumpCardSprite = setUpTrumpCard(game.trumpCard)
  const backOfDeckSprite = setUpBackOfDeck()

  app.ticker.add(delta => gameLoop(delta));

function removePlayerToActText(playerToActText)
{
  playerToActText.parent.removeChild(playerToActText)
}
function removeDeckCountSprite(deckCountText)
{
  deckCountText.parent.removeChild(deckCountText)
}

function setUpOpponentBackOfCards(opponentBackOfCardSprites)
{
  for (let i = 0; i<opponentBackOfCardSprites.length; i++)
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
  function removeAllSpritesOnScreen()
  {
    app.stage.children.forEach((childSprite)=>{
      app.stage.removeChild(childSprite)
    })
  }
}

function gameLoop(delta)
{
  scaleToWindow(app.renderer.view)
}
export { start };
