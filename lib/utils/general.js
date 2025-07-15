"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMyPlayerObject = getMyPlayerObject;
exports.getOpponentPlayer = getOpponentPlayer;
exports.isSinglePlayer = isSinglePlayer;
exports.getPlayerName = getPlayerName;
exports.hideGreeting = hideGreeting;

function getMyPlayerObject(game) {
  const myPlayerObject = game.playerForClientSide;

  if (game.players[0].socketId === myPlayerObject.socketId) {
    return game.players[0];
  } else return game.players[1];
}

function getOpponentPlayer(game) {
  const myPlayerObject = game.playerForClientSide;

  if (game.players[0].socketId === myPlayerObject.socketId) {
    return game.players[1];
  } else return game.players[0];
}

function isSinglePlayer() {
  let params = new URL(document.location).searchParams;
  let singlePlayer = params.get('singlePlayer');
  return singlePlayer;
}

function getPlayerName() {
  let params = new URL(document.location).searchParams;
  let name = params.get('name');
  return name;
}

function hideGreeting() {
  const greetingElement = document.getElementById("greeting");
  const loadingElement = document.getElementById("loading");

  if (greetingElement) {
    greetingElement.innerHTML = null;
  }

  if (loadingElement) {
    loadingElement.innerHTML = null;
  }
}