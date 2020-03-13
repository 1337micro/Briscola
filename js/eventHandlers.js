"use strict";
import { Constants } from './Constants.js'

const socket = io("http://localhost:3000")
function _onCardPress(arg, game)
{
    const cardPressed = arg.currentTarget.card
    socket.on(Constants.events.CARD_PLAYED_CONFIRMED)
    {
        //make sprite invisible
        arg.currentTarget.visible = false;
        //remove sprite from visible screen
        arg.currentTarget.y = -100
    }
    socket.on(Constants.events.CARD_PLAYED_REJECTED)
    {
        console.error("Cannot play your card, it is not your turn")
    }

    socket.emit(Constants.events.CARD_PLAYED, cardPressed)
}

function awaitOpponent()
{
    return new Promise(function(resolve, reject)
    {
        socket.on(Constants.events.PLAYER_JOINED, function(player)
        {
            resolve(player)
            console.log(player)
        })
    })
}

function getGame()
{
    return new Promise(function(resolve, reject)
    {
        socket.on(Constants.events.GAME_START, function(game)
        {
            console.log("Hand recieved", game)
            resolve(game)
        })
    })
}
function requestGameStart()
{
    socket.emit(Constants.events.REQUEST_GAME_START)
}
function getTrumpCard()
{
    return new Promise(function(resolve, reject)
    {
        socket.on(Constants.events.TRUMP_CARD, function(card)
        {
            console.log("Trump card recieved", card)
            resolve(card)
        })
    })
}


function onGameUpdate(cb)
{
    socket.on(Constants.events.UPDATE_GAME, function(game)
    {
        console.log("Game updated", game)
        cb(game)
    })
}
function onCardPlayed(cb)
{
    socket.on(Constants.events.CARD_PLAYED, function(cardPlayed)
    {
        console.log("cardPlayed", cardPlayed)
        cb(cardPlayed)
    })
}
export { _onCardPress, awaitOpponent, getGame,  requestGameStart, onGameUpdate, onCardPlayed}