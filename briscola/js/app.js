"use strict";
import {  start } from './start.js'
import { suits } from './Suits.js'
import { Constants } from './Constants.js'




//Create a Pixi Application
let app = new PIXI.Application({
  width: Constants.width,
  height:Constants.height,
  antialias: true,
  transparent: false,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true
});

app.renderer.backgroundColor = 0x1a5c2e; // rich green felt

app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

function fetListOfImages(){
  let enumSuits = suits();
  let allImages = [];
  for(let i = 1; i<=10; i++)
  {
    Object.keys(enumSuits).forEach(suit => {
       allImages.push("../images/"+i+enumSuits[suit]+".png")
    })
  }
  allImages.push("../images/backOfCard.png")
  return allImages;
}
let allImages = fetListOfImages();
PIXI.loader
    .add(allImages)
    .load(start)

export { app }
