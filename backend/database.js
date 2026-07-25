"use strict";
require('dotenv').config()
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID
const uri = process.env.DB_HOST_PREFIX + process.env.DB_USER +":" + process.env.DB_PASS+ "@" + process.env.DB_HOST_SUFFIX;
console.log(uri)
const client = newMongoClient().connect()
function newMongoClient()
{
    logger.info(uri)
    return new MongoClient(uri, { useNewUrlParser: true })
}
/**
 * 
 * @param {*} mongo ObjectId of game 
 */
async function getGame(id)
{
    if(typeof id === "string")
    {
        id = ObjectID(id)
    }
    return client
        .then(client => {
            const collection = client.db(process.env.DB_GAMES_DATABASE_NAME).collection(process.env.DB_GAMES_COLLECTION_NAME)
            return collection.findOne({_id: id})
        })
        .catch(reason => {
            logger.error(reason)
        })
}
/**
 * Get all the games that contain a player with this socketId
 * @param {String} Player's socketId 
 */
async function getGamesByPlayerSocketId(socketId)
{
    
    return client
        .then(client => {
            const collection = client.db(process.env.DB_GAMES_DATABASE_NAME).collection(process.env.DB_GAMES_COLLECTION_NAME)
            return collection.find({players: {$elemMatch:{socketId:socketId}}})
        })
        .catch(reason => {
            logger.error(reason)
        })
}
/**
 * Insert a new game and return its ID to persist in user session
 * @param game
 * @returns {Promise<String>} the ID of the saved document
 */
function insertNewGame(game)
{
 
    return client
        .then(client => {
            const collection = client.db(process.env.DB_GAMES_DATABASE_NAME).collection(process.env.DB_GAMES_COLLECTION_NAME)
            return collection.insertOne(game)
        })
        .catch(reason => logger.error(reason))

}
/**
 * Insert a new game string and return its ID to persist in user session
 * @param game
 * @returns {Promise<String>} the ID of the saved document
 */
async function insertNewGameString(game)
{
 
    return client
        .then(async client => {
            const collection = client.db(process.env.DB_GAMES_DATABASE_NAME).collection(process.env.DB_GAMES_AS_STRINGS_COLLECTION_NAME)
            const savedDocumentConfirmation = await collection.insertOne(game) //should await if id necessary
            return savedDocumentConfirmation.insertedId
        })
        .catch(reason => logger.error(reason))

}

/**
 * game should have game._id
 * @param game
 * @returns {Promise<ObjectId | void>}
 */
async function saveGame(game)
{

    return client
        .then(client => {
            const collection = client.db(process.env.DB_GAMES_DATABASE_NAME).collection(process.env.DB_GAMES_COLLECTION_NAME)
            const savedDocumentConfirmation = collection.updateOne({_id:game._id}, {
                $set:{
                    middlePile: game.middlePile,
                    deck: game.deck,
                    player1: game.player1,
                    player2: game.player2,
                    players: game.players,
                    trumpCard: game.trumpCard,
                    trumpSuit: game.trumpSuit,
                    firstPlayerToActByIndex: game.firstPlayerToActByIndex,
                    currentPlayerToActByIndex: game.currentPlayerToActByIndex,
                    history: game.history,
                    started: game.started
                }
            }, {upsert:true} )
            return savedDocumentConfirmation;
        })
        .catch(reason => logger.error(reason))
}


/**
 * Atomically claim a free seat in a not-yet-started game.
 *
 * Fixes the seat-hijack race: previously REQUEST_GAME_START read the game,
 * picked an empty seat in memory, then saved — so two concurrent joiners could
 * both read the same seat as empty and overwrite each other (and a joiner to a
 * full game defaulted to seat 0, clobbering player 1). Here the emptiness check
 * and the write happen in a single findOneAndUpdate, so only one caller can win
 * a given seat.
 *
 * Seats are tried in order (player1 then player2). The filter `<seat>: null`
 * matches both null and a missing field, so a freshly-inserted game qualifies.
 *
 * @param {String} id game ObjectId (string or ObjectID)
 * @param {String} socketId claiming socket's id
 * @param {String} playerName
 * @returns {Promise<{playerIndex:number, game:Object}|null>} claimed seat + the
 *          updated game document, or null if no seat is free / the game started.
 */
async function claimSeat(id, socketId, playerName)
{
    if (typeof id === "string") {
        id = ObjectID(id)
    }
    const seats = [
        {index: 0, seat: "player1", arr: "players.0"},
        {index: 1, seat: "player2", arr: "players.1"}
    ]
    const connectedClient = await client
    const collection = connectedClient
        .db(process.env.DB_GAMES_DATABASE_NAME)
        .collection(process.env.DB_GAMES_COLLECTION_NAME)

    for (const s of seats) {
        const set = {}
        set[s.seat + ".socketId"] = socketId
        set[s.seat + ".name"] = playerName
        set[s.arr + ".socketId"] = socketId
        set[s.arr + ".name"] = playerName

        const filter = {_id: id, started: {$ne: true}}
        filter[s.seat + ".socketId"] = null // matches null OR missing

        const result = await collection.findOneAndUpdate(
            filter,
            {$set: set},
            {returnOriginal: false} // mongodb v3 driver: return the updated doc
        )
        if (result && result.value) {
            return {playerIndex: s.index, game: result.value}
        }
    }
    return null // no free seat (game full or already started)
}

module.exports.getGame = getGame;
module.exports.claimSeat = claimSeat;
module.exports.insertNewGame = insertNewGame;
module.exports.insertNewGameString = insertNewGameString;
module.exports.saveGame = saveGame;
module.exports.getGamesByPlayerSocketId = getGamesByPlayerSocketId;
