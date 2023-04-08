import { Constants } from "../Constants.js";

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

function isMyTurnToAct(game)
{
  const playerToAct = game.players[game.currentPlayerToActByIndex]
  const myPlayerObject = game.playerForClientSide
  return playerToAct && myPlayerObject && playerToAct.socketId === myPlayerObject.socketId
}

export function generatePlayerToActText(game)
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
export function generateYourPlayerNameText(game)
{
  const nameTextStyle = {fontFamily : 'Arial', fontSize: 24, align : 'center', fill: "#ff0000"}

  let yourNameText = new PIXI.Text(game.playerForClientSide.name, nameTextStyle)
  
  yourNameText.x = screenWidth - 300;
  yourNameText.y = screenHeight - 100;

  return  yourNameText
}
export function generateDeckCount(game)
{
  const numCardsInDeck = game.deck.cards.length;
  const numCardsInDeckText =  new PIXI.Text(`Deck: ${numCardsInDeck}`, {fontSize: 24, align : 'center'});

  numCardsInDeckText.x =  screenWidth - 300
  numCardsInDeckText.y = screenHeight / 2 + 140

  return numCardsInDeckText;
}

export function generateTrumpSuitTextSprite(trumpCard){
  const trumpSuitString = Constants.gameConstants.MAP_ABBREVIATION_TO_SUITS[trumpCard.suit];
  const trumpSuitText = new PIXI.Text(`Trump Suit: ${trumpSuitString}`, {fontSize: 24, align : 'center'});
 
  trumpSuitText.x = screenWidth - 300
  trumpSuitText.y = screenHeight / 2 + 180
  return trumpSuitText;
}
