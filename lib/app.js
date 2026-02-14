"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.app = void 0;

var _start = require("./start.js");

var _Suits = require("./Suits.js");

var _Constants = require("./Constants.js");

//Create a Pixi Application
let app = new PIXI.Application({
  width: _Constants.Constants.width,
  height: _Constants.Constants.height,
  antialias: true,
  // default: false
  transparent: false,
  // default: false
  resolution: 1 // default: 1

});
exports.app = app;
app.renderer.backgroundColor = 0xFFFFFF; // white

app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

function fetListOfImages() {
  let enumSuits = (0, _Suits.suits)();
  let allImages = [];

  for (let i = 1; i <= 10; i++) {
    Object.keys(enumSuits).forEach(suit => {
      allImages.push("../images/" + i + enumSuits[suit] + ".png");
    });
  }

  allImages.push("../images/backOfCard.png");
  return allImages;
}

let allImages = fetListOfImages();
PIXI.loader.add(allImages).load(_start.start);