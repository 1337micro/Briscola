"use strict";
import {  start } from './game.js'
import { suits } from './Suits.js'
import { Constants } from './Constants.js'




//Create a Pixi Application
let app = new PIXI.Application({
  width: Constants.width,
  height:Constants.height,
  antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
});
app.renderer.backgroundColor = 0x66CD00 // green

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

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
