"use strict";
import { Constants } from './Constants.js'

const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('gameId');
const socket = io(`http://${window.location.hostname}:3000?gameId=`+gameId )
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

function requestGameStart(playerName)
{
    socket.emit(Constants.events.REQUEST_GAME_START, playerName)
}
function requestSinglePlayerGameStart()
{
    socket.emit(Constants.events.REQUEST_SINGLE_PLAYER_GAME_START)
}

function onGameUpdate(cb)
{
    socket.on(Constants.events.UPDATE_GAME, function(game)
    {
        cb(game)
    })
}
function onCardPlayed(cb)
{
    socket.on(Constants.events.CARD_PLAYED, function(cardPlayed)
    {
        cb(cardPlayed)
    })
}
function onComputerCardPlayed(cb)
{
    socket.on(Constants.events.COMPUTER_CARD_PLAYED, function(cardPlayed)
    {
        cb(cardPlayed)
    })
}

function onFirstToActComputerCardPlayed(cb)
{
    socket.on(Constants.events.FIRST_TO_ACT_COMPUTER_CARD_PLAYED, function(cardPlayed)
    {
        cb(cardPlayed)
    })
}

function onRoundOver(cb)
{
    socket.on(Constants.events.ROUND_OVER, function(winningPlayer){
        cb(winningPlayer)
    })
}
function onLastDeal(cb)
{
    socket.on(Constants.events.LAST_DEAL, function(){
        cb()
    })
}
function onGameOver(cb)
{
    socket.on(Constants.events.GAME_OVER, function(game){
        cb(game)
    })
}
function onServerConnectionLost(cb)
{
    socket.on('disconnect', function(reason){
        cb(reason)
    })
}
function onOpponentLeft(cb)
{
    socket.on(Constants.events.PLAYER_LEFT, function(leavingPlayerSocketId){
        cb(leavingPlayerSocketId)
    })
}
function onRedirect(cb)
{
    socket.on(Constants.events.REDIRECT, function(newUrl){
        cb(newUrl)
    })
}
export {
    _onCardPress, 
    awaitOpponent, 
    getGame,  
    requestGameStart, 
    requestSinglePlayerGameStart, 
    onGameUpdate, 
    onCardPlayed, 
    onComputerCardPlayed, 
    onFirstToActComputerCardPlayed, 
    onRoundOver, 
    onLastDeal, 
    onGameOver, 
    onServerConnectionLost, 
    onOpponentLeft, 
    onRedirect
}