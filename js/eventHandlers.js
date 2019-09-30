"use strict";
import { Constants } from './Constants.js'

const socket = io("http://localhost:3000")
function _onCardPress(arg)
{
    arg.currentTarget.y = Constants.height / 2
    arg.currentTarget.y -= Math.random() * 10

    const cardPressed = arg.currentTarget.card
    socket.emit(Constants.events.CARD_PLAYED, cardPressed)
    console.log("pressed")
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


export { _onCardPress, awaitOpponent, getGame, getTrumpCard }