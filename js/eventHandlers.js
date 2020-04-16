"use strict";
import { Constants } from './Constants.js'

const socket = io("http://localhost:3000")
function _onCardPress(arg, game)
{
    const cardPressed = arg.currentTarget.card
    const cardSprite = arg.target
    socket.on(Constants.events.CARD_PLAYED_CONFIRMED, onCardPlaySuccess)
    socket.on(Constants.events.CARD_PLAYED_REJECTED, onCardPlayFail)

    socket.emit(Constants.events.CARD_PLAYED, cardPressed)

    function onCardPlayFail() {
        console.error("Cannot play your card, it is not your turn");
    }

    function onCardPlaySuccess() {
        cardSprite.parent.removeChild(cardSprite)
    }
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
        socket.on(Constants.events.GET_GAME, function(game)
        {
            resolve(game)
        })
    })
}
function gameStart()
{
    return new Promise(function(resolve, reject)
    {
        socket.on(Constants.events.GAME_START, function()
        {            
            resolve()
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
function onRoundOver(cb)
{
    socket.on(Constants.events.ROUND_OVER, function(winningPlayer){
        console.log("round over", winningPlayer)
        cb(winningPlayer)
    })
}
function onLastDeal(cb)
{
    socket.on(Constants.events.LAST_DEAL, function(){
        console.log("Last round")
        cb()
    })
}
function onGameOver(cb)
{
    socket.on(Constants.events.GAME_OVER, function(game){
        console.log("game over")
        cb(game)
    })
}
export { _onCardPress, awaitOpponent, getGame,gameStart,  requestGameStart, onGameUpdate, onCardPlayed, onRoundOver, onLastDeal, onGameOver}