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
  onFirstToActComputerCardPlayed, callBrisk, onBriskCalled
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
  removeHandCardSprites, _positionBriskCalledSprite, _positionBriskCalledText
} from './utils/sprites.js'
import {
  generatePlayerToActText, 
  generateYourPlayerNameText, 
  generateDeckCount, 
  generateTrumpSuitTextSprite,
  isMyTurnToAct
} from './utils/generators.js'
import {hideGreeting, isSinglePlayer, getLobbyName, getMyPlayerObject, getOpponentPlayer} from './utils/general.js'
import { scaleToWindow } from './utils/scaleWindow.js'

const PLAY_CARD_SOUND = new Howl({ src:[Constants.soundUrl.PLAY_CARD], volume: 0.35 });
const SHUFFLE_CARDS_SOUND = new Howl({ src:[Constants.soundUrl.SHUFFLE_CARDS], volume: 0.25 });

const HORSE_RANK = 9;
const KING_RANK = 10;

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

  // ─── Felt table background ───
  const feltBg = new PIXI.Graphics();
  feltBg.beginFill(0x1a5c2e);
  feltBg.drawRect(0, 0, screenWidth, screenHeight);
  feltBg.endFill();
  app.stage.addChild(feltBg);

  // Subtle radial vignette
  const vignette = new PIXI.Graphics();
  vignette.beginFill(0x000000, 0.25);
  vignette.drawRect(0, 0, screenWidth, screenHeight);
  vignette.endFill();
  const vignetteHole = new PIXI.Graphics();
  vignetteHole.beginFill(0xffffff);
  vignetteHole.drawEllipse(screenWidth / 2, screenHeight / 2, screenWidth * 0.55, screenHeight * 0.55);
  vignetteHole.endFill();
  vignette.mask = null; // will use alpha instead
  vignette.alpha = 0.15;
  app.stage.addChild(vignette);

  // Decorative table edge
  const tableEdge = new PIXI.Graphics();
  tableEdge.lineStyle(3, 0xffd700, 0.15);
  tableEdge.drawRoundedRect(20, 20, screenWidth - 40, screenHeight - 40, 30);
  app.stage.addChild(tableEdge);

  // Center line separator
  const centerLine = new PIXI.Graphics();
  centerLine.lineStyle(1, 0xffffff, 0.06);
  centerLine.moveTo(screenWidth * 0.15, screenHeight / 2 + 60);
  centerLine.lineTo(screenWidth * 0.65, screenHeight / 2 + 60);
  app.stage.addChild(centerLine);

  let playerToActText = generatePlayerToActText(game)
  app.stage.addChild(playerToActText)

  let yourNameText = generateYourPlayerNameText(game)
  app.stage.addChild(yourNameText)

  let deckCountText = generateDeckCount(game);
  app.stage.addChild(deckCountText)

  let trumpSuitText = generateTrumpSuitTextSprite(game.trumpSuit);
  app.stage.addChild(trumpSuitText)

  let middlePileCardSprites = []
  let horseKingButtons = []
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

      app.stage.removeChild(trumpSuitText)
      trumpSuitText = generateTrumpSuitTextSprite(game.trumpSuit);
      app.stage.addChild(trumpSuitText)

      updateHorseKingButtons(game)

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
  onBriskCalled((suit) => {
    PLAY_CARD_SOUND.play()
    PLAY_CARD_SOUND.play()

    const FONT = 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    let horse = _generateCardSprite(`../images/9${suit}.png`)
    let king = _generateCardSprite(`../images/10${suit}.png`)
    const briscolaCalledText = new PIXI.Text(
      `BRISCOLA of ${Constants.gameConstants.MAP_ABBREVIATION_TO_SUITS[suit]} called!`,
      { fontFamily: FONT, fontSize: 20, fontWeight: '700', fill: '#fdd835',
        dropShadow: true, dropShadowColor: '#000', dropShadowBlur: 4, dropShadowDistance: 2 }
    );

    _positionBriskCalledSprite(horse, 0)
    _positionBriskCalledSprite(king, 1)
    _positionBriskCalledText(briscolaCalledText)

    _scaleSpriteDownTo(0.5, horse)
    _scaleSpriteDownTo(0.5, king)
    addCardSpriteToStage(horse)
    addCardSpriteToStage(king)
    addCardSpriteToStage(briscolaCalledText)

    setTimeout(()=>{
      app.stage.removeChild(horse)
      app.stage.removeChild(king)
      app.stage.removeChild(briscolaCalledText)
    }, 3000)


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

    const FONT = 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    const myPlayerObject = getMyPlayerObject(game);
    const opponentPlayer = getOpponentPlayer(game);
    const isWin = myPlayerObject.points > opponentPlayer.points;
    const isTie = myPlayerObject.points === opponentPlayer.points;

    // Dark overlay
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.55);
    overlay.drawRect(0, 0, screenWidth, screenHeight);
    overlay.endFill();
    app.stage.addChild(overlay);

    // Card-style modal
    const modalW = 420, modalH = 300;
    const modalX = (screenWidth - modalW) / 2;
    const modalY = (screenHeight - modalH) / 2;
    const modal = new PIXI.Graphics();
    modal.beginFill(0x1b5e20, 0.92);
    modal.drawRoundedRect(0, 0, modalW, modalH, 20);
    modal.endFill();
    modal.lineStyle(2, 0xffd700, 0.3);
    modal.drawRoundedRect(0, 0, modalW, modalH, 20);
    modal.x = modalX;
    modal.y = modalY;
    app.stage.addChild(modal);

    // Result headline
    const headline = isWin ? '🏆  YOU WIN!' : isTie ? '🤝  TIE GAME' : '😔  YOU LOSE';
    const headlineText = new PIXI.Text(headline, {
      fontFamily: FONT, fontSize: 36, fontWeight: '800',
      fill: isWin ? '#fdd835' : isTie ? '#ffffff' : '#ef9a9a',
      dropShadow: true, dropShadowColor: '#000', dropShadowBlur: 6, dropShadowDistance: 2
    });
    headlineText.anchor.set(0.5);
    headlineText.x = modalX + modalW / 2;
    headlineText.y = modalY + 70;
    app.stage.addChild(headlineText);

    // Divider
    const divider = new PIXI.Graphics();
    divider.lineStyle(1, 0xffffff, 0.15);
    divider.moveTo(modalX + 40, modalY + 120);
    divider.lineTo(modalX + modalW - 40, modalY + 120);
    app.stage.addChild(divider);

    // Score
    const scoreText = new PIXI.Text(
      `You: ${myPlayerObject.points}   •   Opponent: ${opponentPlayer.points}`,
      { fontFamily: FONT, fontSize: 22, fontWeight: '600', fill: '#ffffff',
        dropShadow: true, dropShadowColor: '#000', dropShadowBlur: 4, dropShadowDistance: 1 }
    );
    scoreText.anchor.set(0.5);
    scoreText.x = modalX + modalW / 2;
    scoreText.y = modalY + 160;
    app.stage.addChild(scoreText);

    // Subtitle
    const subText = new PIXI.Text('Game Over', {
      fontFamily: FONT, fontSize: 14, fill: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: 3
    });
    subText.anchor.set(0.5);
    subText.x = modalX + modalW / 2;
    subText.y = modalY + 30;
    app.stage.addChild(subText);

    // Play again hint
    const hintText = new PIXI.Text('Refresh to play again', {
      fontFamily: FONT, fontSize: 14, fill: 'rgba(255,255,255,0.4)', fontStyle: 'italic'
    });
    hintText.anchor.set(0.5);
    hintText.x = modalX + modalW / 2;
    hintText.y = modalY + modalH - 40;
    app.stage.addChild(hintText);
  })
  onServerConnectionLost((reason)=>{
    removeAllSpritesOnScreen()
    _showDisconnectOverlay('Connection Lost', 'Server connection was interrupted. Game aborted.')
  })
  onOpponentLeft((reason)=>{
    removeAllSpritesOnScreen()
    _showDisconnectOverlay('Opponent Left', 'Your opponent has disconnected. Game aborted.')
  })
  function _showDisconnectOverlay(title, subtitle) {
    const FONT = 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.55);
    overlay.drawRect(0, 0, screenWidth, screenHeight);
    overlay.endFill();
    app.stage.addChild(overlay);

    const modalW = 400, modalH = 180;
    const mx = (screenWidth - modalW) / 2, my = (screenHeight - modalH) / 2;
    const modal = new PIXI.Graphics();
    modal.beginFill(0x4e342e, 0.92);
    modal.drawRoundedRect(0, 0, modalW, modalH, 16);
    modal.endFill();
    modal.x = mx; modal.y = my;
    app.stage.addChild(modal);

    const t = new PIXI.Text(title, { fontFamily: FONT, fontSize: 26, fontWeight: '800', fill: '#ef9a9a',
      dropShadow: true, dropShadowColor: '#000', dropShadowBlur: 4, dropShadowDistance: 1 });
    t.anchor.set(0.5);
    t.x = mx + modalW / 2; t.y = my + 60;
    app.stage.addChild(t);

    const s = new PIXI.Text(subtitle, { fontFamily: FONT, fontSize: 15, fill: 'rgba(255,255,255,0.6)' });
    s.anchor.set(0.5);
    s.x = mx + modalW / 2; s.y = my + 110;
    app.stage.addChild(s);
  }
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
 
  const trumpCardSprite = game.gameType === Constants.gameConstants.BRSICOLA_500 ? null: setUpTrumpCard(game.trumpCard);
  const backOfDeckSprite = setUpBackOfDeck()

  updateHorseKingButtons(game)

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

  function findHorseKingSuits(hand) {
    const suitRanks = {};
    for (const card of hand.cards) {
      if (card.rank === HORSE_RANK || card.rank === KING_RANK) {
        if (!suitRanks[card.suit]) suitRanks[card.suit] = new Set();
        suitRanks[card.suit].add(card.rank);
      }
    }
    return Object.keys(suitRanks).filter(suit =>
      suitRanks[suit].has(HORSE_RANK) && suitRanks[suit].has(KING_RANK)
    );
  }

  function callBriskButton(suitAbbr, index, enabled) {
    const FONT = 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    const suitName = Constants.gameConstants.MAP_ABBREVIATION_TO_SUITS[suitAbbr];

    const button = new PIXI.Container();

    const bg = new PIXI.Graphics();
    if (enabled) {
      bg.beginFill(0x2e7d32, 0.9);
    } else {
      bg.beginFill(0x555555, 0.5);
    }
    bg.drawRoundedRect(0, 0, 220, 40, 20);
    bg.endFill();
    if (enabled) {
      bg.lineStyle(1.5, 0x66bb6a, 0.5);
      bg.drawRoundedRect(0, 0, 220, 40, 20);
    }
    button.addChild(bg);

    const text = new PIXI.Text(`Call Briscola of ${suitName}`, {
      fontFamily: FONT,
      fontSize: 14,
      fontWeight: '600',
      fill: enabled ? 0xFFFFFF : 0xAAAAAA,
      align: 'center'
    });
    text.x = 18;
    text.y = 11;
    button.addChild(text);

    button.x = 0.05 * screenWidth;
    button.y = (screenHeight - 260) + (index * 50);

    button.interactive = enabled;
    button.buttonMode = enabled;

    if (enabled) {
      button.on('pointerover', () => { bg.alpha = 0.8; });
      button.on('pointerout', () => { bg.alpha = 1; });
    }

    button.on('pointerdown', () => {
      callBrisk(suitAbbr)
    });

    return button;
  }

  function updateHorseKingButtons(game) {
    for (const btn of horseKingButtons) {
      if (btn.parent) btn.parent.removeChild(btn);
    }
    if(game.gameType === Constants.gameConstants.BRSICOLA_500 && game.trumpSuit == null) {
      horseKingButtons = [];

      const hand = game.playerForClientSide.hand;
      const matchingSuits = findHorseKingSuits(hand);
      const myTurn = isMyTurnToAct(game);

      matchingSuits.forEach((suit, index) => {
        const button = callBriskButton(suit, index, myTurn);
        app.stage.addChild(button);
        horseKingButtons.push(button);
      });
    }
  }
}

function gameLoop(delta)
{
  scaleToWindow(app.renderer.view)
}
export { start };
