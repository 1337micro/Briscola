import { Constants } from "../Constants.js";

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

/* ─── Shared text styles ─── */
const FONT_FAMILY = 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';

const turnIndicatorStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: 20,
  fontWeight: '700',
  fill: '#ffffff',
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowDistance: 2,
  letterSpacing: 0.5
};

const hudLabelStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: 15,
  fontWeight: '600',
  fill: 'rgba(255,255,255,0.55)',
  letterSpacing: 0.8
};

const hudValueStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: 20,
  fontWeight: '700',
  fill: '#ffffff',
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 3,
  dropShadowDistance: 1
};

function _createHudPanel(x, y, width, height) {
  const panel = new PIXI.Graphics();
  panel.beginFill(0x000000, 0.25);
  panel.drawRoundedRect(0, 0, width, height, 12);
  panel.endFill();
  // subtle border
  panel.lineStyle(1, 0xffffff, 0.08);
  panel.drawRoundedRect(0, 0, width, height, 12);
  panel.x = x;
  panel.y = y;
  return panel;
}

export function isMyTurnToAct(game)
{
  const playerToAct = game.players[game.currentPlayerToActByIndex]
  const myPlayerObject = game.playerForClientSide
  return playerToAct && myPlayerObject && playerToAct.socketId === myPlayerObject.socketId
}

export function generatePlayerToActText(game)
{
  const isMyTurn = isMyTurnToAct(game);
  const label = isMyTurn ? '● YOUR MOVE' : "○ OPPONENT'S MOVE";

  const container = new PIXI.Container();

  // Pill background
  const pill = new PIXI.Graphics();
  const pillW = 200, pillH = 40;
  pill.beginFill(isMyTurn ? 0x2e7d32 : 0x5d4037, 0.85);
  pill.drawRoundedRect(0, 0, pillW, pillH, pillH / 2);
  pill.endFill();
  // glow border
  pill.lineStyle(1.5, isMyTurn ? 0x66bb6a : 0x8d6e63, 0.6);
  pill.drawRoundedRect(0, 0, pillW, pillH, pillH / 2);
  container.addChild(pill);

  const text = new PIXI.Text(label, {
    ...turnIndicatorStyle,
    fontSize: 15,
    fill: isMyTurn ? '#a5d6a7' : '#d7ccc8'
  });
  text.anchor.set(0.5);
  text.x = pillW / 2;
  text.y = pillH / 2;
  container.addChild(text);

  container.x = 0.05 * screenWidth;
  container.y = screenHeight - 310;

  return container;
}

export function generateYourPlayerNameText(game)
{
  const container = new PIXI.Container();
  const panel = _createHudPanel(0, 0, 200, 48);
  container.addChild(panel);

  const label = new PIXI.Text('YOU', hudLabelStyle);
  label.x = 14; label.y = 6;
  container.addChild(label);

  const nameText = new PIXI.Text(game.playerForClientSide.name || 'Player', {
    ...hudValueStyle,
    fontSize: 16
  });
  nameText.x = 14; nameText.y = 24;
  container.addChild(nameText);

  container.x = screenWidth - 230;
  container.y = screenHeight - 70;
  return container;
}

export function generateDeckCount(game)
{
  const numCardsInDeck = game.deck.cards.length;

  const container = new PIXI.Container();
  const panel = _createHudPanel(0, 0, 140, 56);
  container.addChild(panel);

  const label = new PIXI.Text('DECK', hudLabelStyle);
  label.x = 14; label.y = 6;
  container.addChild(label);

  const value = new PIXI.Text(`${numCardsInDeck}`, hudValueStyle);
  value.x = 14; value.y = 26;
  container.addChild(value);

  container.x = screenWidth - 230;
  container.y = screenHeight / 2 + 130;
  return container;
}

export function generateTrumpSuitTextSprite(trumpSuit){
  const trumpSuitString = trumpSuit ? Constants.gameConstants.MAP_ABBREVIATION_TO_SUITS[trumpSuit] : 'None';

  const container = new PIXI.Container();
  const panel = _createHudPanel(0, 0, 180, 56);
  container.addChild(panel);

  const label = new PIXI.Text('TRUMP', hudLabelStyle);
  label.x = 14; label.y = 6;
  container.addChild(label);

  const value = new PIXI.Text(trumpSuitString, {
    ...hudValueStyle,
    fill: '#fdd835'
  });
  value.x = 14; value.y = 26;
  container.addChild(value);

  container.x = screenWidth - 230;
  container.y = screenHeight / 2 + 200;
  return container;
}
