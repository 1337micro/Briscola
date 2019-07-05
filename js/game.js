"use strict";
import { app } from './index.js'
import { Deck } from './Deck.js'


function start()
{
  const deck = new Deck();
  deck.generateDeck();
  deck.shuffle();

  let card1Sprite = new PIXI.Sprite(
    PIXI.loader.resources[`../images/${deck.cards[0]}.png`].texture
  );
  card1Sprite.x = 0;
  card1Sprite.y = 0
  let card2Sprite = new PIXI.Sprite(
    PIXI.loader.resources[`../images/${deck.cards[1]}.png`].texture
  );
  card2Sprite.x = 200;
  card2Sprite.y = 0;
  let card3Sprite = new PIXI.Sprite(
    PIXI.loader.resources[`../images/${deck.cards[2]}.png`].texture
  );
  card3Sprite.x = 400;
  card3Sprite.y = 0;
  app.stage.addChild(card1Sprite);
  app.stage.addChild(card2Sprite);
  app.stage.addChild(card3Sprite);
}
function generateDeck(){

}
export { start };
