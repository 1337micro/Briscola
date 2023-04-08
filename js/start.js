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
import { scaleToWindow } from './utils/scaleWindow.js'

const PLAY_CARD_SOUND = new Howl({ src:[Constants.soundUrl.PLAY_CARD], volume: 0.35 });
const SHUFFLE_CARDS_SOUND = new Howl({ src:[Constants.soundUrl.SHUFFLE_CARDS], volume: 0.25 });
function hideGreeting()
{
  const greetingElement = document.getElementById("greeting");
  const loadingElement = document.getElementById("loading");
  if(greetingElement)
  {
    greetingElement.innerHTML = null;
  }
  if(loadingElement) {
    loadingElement.innerHTML = null;
  }
}

function isSinglePlayer(){
  let params = (new URL(document.location)).searchParams;
  let singlePlayer = params.get('singlePlayer');
  return singlePlayer;
}

function getPlayerName(){
  let params = (new URL(document.location)).searchParams;
  let name = params.get('name');
  return name;
}

let game;
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
async function start()
{
  onRedirect((newUrl)=>{
    window.location.assign(newUrl)
  })

  isSinglePlayer() ? requestSinglePlayerGameStart() : requestGameStart(getPlayerName());
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
      cardSprites = addPlayerHandSprites(game.playerForClientSide)
      
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
    showNewGameButton()
  })
  onServerConnectionLost((reason)=>{
    removeAllSpritesOnScreen()
    const gameOverStyle = {fontFamily : 'Arial', fontSize: 24, align : 'center'}
    const gameOverText = new PIXI.Text('Server connection lost. Game aborted. ', gameOverStyle);
    gameOverText.x = screenWidth/2
    gameOverText.y = screenHeight/2
    app.stage.addChild(gameOverText)

    showNewGameButton()
  })
  onOpponentLeft((reason)=>{
    removeAllSpritesOnScreen()
    const gameOverStyle = {fontFamily : 'Arial', fontSize: 24, align : 'center'}
    const gameOverText = new PIXI.Text('Opponent Left. Game aborted. ', gameOverStyle);
    gameOverText.x = screenWidth/2
    gameOverText.y = screenHeight/2
    app.stage.addChild(gameOverText)

    showNewGameButton()
  })
  function redirectToNewGame()
  {
    window.location.assign("/new")
  }
  function showNewGameButton()
  {
    const gameOverStyle = {fontFamily : 'Arial', fontSize: textFontSize, align : 'center'}
    const refreshPageForNewGame = new PIXI.Text('CLICK HERE FOR A NEW GAME', gameOverStyle);
    refreshPageForNewGame.buttonMode = true
    refreshPageForNewGame.interactive = true
    refreshPageForNewGame.backgroundColor = 0x000000
    refreshPageForNewGame.x = textPositionX
    refreshPageForNewGame.y = textPositionY
    refreshPageForNewGame.tap = redirectToNewGame
    refreshPageForNewGame.click = redirectToNewGame
    app.stage.addChild(refreshPageForNewGame)
  }

  let cardSprites = addPlayerHandSprites(game.playerForClientSide)
  let opponentBackOfCardSprites = _generateOpponentCardSprites(game);
  setUpOpponentBackOfCards(opponentBackOfCardSprites)

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



  app.ticker.add(delta => gameLoop(delta));

function removePlayerToActText(playerToActText)
{
  playerToActText.parent.removeChild(playerToActText)
}
function removeDeckCountSprite(deckCountText)
{
  deckCountText.parent.removeChild(deckCountText)
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
  playerToActText.x = 0.05*screenWidth;
  playerToActText.y = screenHeight - 300;

  return  playerToActText
}
function generateYourPlayerNameText(game)
{
  const nameTextStyle = {fontFamily : 'Arial', fontSize: 24, align : 'center', fill: "#ff0000"}

  let yourNameText = new PIXI.Text(game.playerForClientSide.name, nameTextStyle)
  
  yourNameText.x = screenWidth - 300;
  yourNameText.y = screenHeight - 100;

  return  yourNameText
}
function generateDeckCount(game)
{
  const numCardsInDeck = game.deck.cards.length;
  const numCardsInDeckText =  new PIXI.Text(`Deck: ${numCardsInDeck}`, {fontSize: 24, align : 'center'});

  numCardsInDeckText.x =  screenWidth - 300
  numCardsInDeckText.y = screenHeight / 2 + 140

  return numCardsInDeckText;
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
function generateTrumpSuitTextSprite(trumpCard){
  const trumpSuitString = Constants.gameConstants.MAP_ABBREVIATION_TO_SUITS[trumpCard.suit];
  const trumpSuitText = new PIXI.Text(`Trump Suit: ${trumpSuitString}`, {fontSize: 24, align : 'center'});
 
  trumpSuitText.x = screenWidth - 300
  trumpSuitText.y = screenHeight / 2 + 180
  return trumpSuitText;
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
function _generateOpponentCardSprites(game)
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
    _positionCardSprite(backOfCardSprite, screenWidth / 4 + 100*i, 0)
  })
  _rotateCardSprites(backOfCardSprites, false)
}
function _positionBackOfCard(backOfCardSprite)
{
    _positionCardSprite(backOfCardSprite, screenWidth - 300, screenHeight / 2 - 100)
}
function _positionPileCard(pileCardSprite)
{
    const randomDisplacement = 185 * Math.random(); 
    _positionCardSprite(pileCardSprite, (screenWidth / 2 - 200) + randomDisplacement, screenHeight / 2)
    pileCardSprite.anchor.x = 0.5
    pileCardSprite.anchor.y = 0.5
    pileCardSprite.rotation = Math.random()/2
}
function _positionTrumpCard(trumpCardSprite)
{
  _positionCardSprite(trumpCardSprite, screenWidth - 300, screenHeight / 2 - 100)
  trumpCardSprite.anchor.x = 0.5
  trumpCardSprite.anchor.y = 0.5
  trumpCardSprite.rotation = Math.PI /2
}
//for hand
function _positionCardSprites(cardSprites)
{
  cardSprites.forEach((cardSprite, i) => {
    _positionCardSprite(cardSprite, screenWidth / 4 + 100*i, screenHeight - 100)
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
      app.stage.removeChild(childSprite)
    })
  }

function gameLoop(delta)
{
  scaleToWindow(app.renderer.view)
}
export { start };
