"use strict";
import { app } from './app.js'
import { Constants } from './Constants.js'
import { Game } from './Game.js'
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
  onFirstToActComputerCardPlayed,
  declareTrump,
  onTrumpDeclared,
  onTrumpDeclarationRejected
} from './eventHandlers.js'
import {
  _rotateCardSprites,
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
import {hideGreeting, isSinglePlayer, getPlayerName, getMyPlayerObject, getOpponentPlayer} from './utils/general.js'
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
  let trumpSuitText = generateTrumpSuitTextSprite(game.trumpCard || game.trumpSuit);
  app.stage.addChild(deckCountText)
  if (trumpSuitText) {
    app.stage.addChild(trumpSuitText)
  }

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
      
      // Update trump suit text if trump has been declared
      if (game.trumpSuit && !trumpSuitText) {
        trumpSuitText = generateTrumpSuitTextSprite(game.trumpSuit)
        if (trumpSuitText) {
          app.stage.addChild(trumpSuitText)
        }
      }
      
      // Update trump declaration buttons
      updateTrumpDeclarationButtons(game)

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

  let trumpDeclarationButtons = []
  
  onTrumpDeclared((trumpDeclaration) => {
    // Remove trump declaration buttons when trump is declared
    removeTrumpDeclarationButtons()
    
    // Add trump suit text if it doesn't exist yet
    if (!trumpSuitText && trumpDeclaration.suit) {
      trumpSuitText = generateTrumpSuitTextSprite(trumpDeclaration.suit)
      if (trumpSuitText) {
        app.stage.addChild(trumpSuitText)
      }
    }
  })
  
  onTrumpDeclarationRejected((reason) => {
    console.error("Trump declaration rejected:", reason)
  })
  function redirectToNewGame()
  {
    window.location.assign("/new")
  }

  let cardSprites = addPlayerHandSprites(game.playerForClientSide)
  let opponentBackOfCardSprites = _generateOpponentCardSprites(game);
  setUpOpponentBackOfCards(opponentBackOfCardSprites)
  
  // Initialize trump declaration buttons if needed
  updateTrumpDeclarationButtons(game)

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
 
  const trumpCardSprite = game.trumpCard ? setUpTrumpCard(game.trumpCard) : null;
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

  function createTrumpDeclarationButtons(availableDeclarations) {
    removeTrumpDeclarationButtons() // Remove existing buttons first
    
    const suitNames = {
      's': 'Spade',
      'c': 'Coppe', 
      'd': 'Denari',
      'b': 'Bastoni'
    }
    
    availableDeclarations.forEach((suit, index) => {
      const buttonStyle = {
        fontFamily: 'Arial', 
        fontSize: 16, 
        fill: 0x000000,
        backgroundColor: 0xFFFFFF,
        padding: 5
      }
      
      const buttonText = new PIXI.Text(`Declare ${suitNames[suit]} Trump`, buttonStyle)
      buttonText.x = 10
      buttonText.y = 100 + (index * 30)
      buttonText.interactive = true
      buttonText.buttonMode = true
      
      buttonText.on('pointerdown', () => {
        declareTrump(suit)
      })
      
      trumpDeclarationButtons.push(buttonText)
      app.stage.addChild(buttonText)
    })
  }
  
  function removeTrumpDeclarationButtons() {
    trumpDeclarationButtons.forEach(button => {
      if (button.parent) {
        button.parent.removeChild(button)
      }
    })
    trumpDeclarationButtons = []
  }
  
  function updateTrumpDeclarationButtons(game) {
    if (game.gameVariant === Constants.gameVariants.BRISCOLA_500 && 
        !game.trumpDeclared) {
      
      // Check if it's the current player's turn
      const myPlayerObject = getMyPlayerObject(game)
      const currentPlayerToAct = game.players[game.currentPlayerToActByIndex]
      const isMyTurn = myPlayerObject.socketId === currentPlayerToAct.socketId
      
      if (isMyTurn) {
        // Get player index
        const playerIndex = game.players[0].socketId === myPlayerObject.socketId ? 0 : 1
        
        // Create a proper Game instance to access methods
        const gameInstance = new Game(game)
        
        // Get available trump declarations for current player
        const availableDeclarations = gameInstance.getAvailableTrumpDeclarations(playerIndex)
        
        if (availableDeclarations.length > 0) {
          createTrumpDeclarationButtons(availableDeclarations)
        } else {
          removeTrumpDeclarationButtons()
        }
      } else {
        removeTrumpDeclarationButtons()
      }
    } else {
      removeTrumpDeclarationButtons()
    }
  }
}

function gameLoop(delta)
{
  scaleToWindow(app.renderer.view)
}
export { start };
