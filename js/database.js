"use strict";
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DB_HOST_PREFIX + process.env.DB_USER +":" + process.env.DB_PASS+ "@" + process.env.DB_HOST_SUFFIX;

const client = newMongoClient().connect()
function newMongoClient()
{
    return new MongoClient(uri, { useNewUrlParser: true })
}

async function getGame(id)
{
    
    return client
        .then(client => {
            const collection = client.db(process.env.DB_GAMES_DATABASE_NAME).collection(process.env.DB_GAMES_COLLECTION_NAME)
            return collection.findOne({_id: id})
        })
        .catch(reason => {
            console.error(reason)
        })
}

/**
 * Insert a new game and return its ID to persist in user session
 * @param game
 * @returns {Promise<String>} the ID of the saved document
 */
async function insertNewGame(game)
{
 
    return client
        .then(client => {
            const collection = client.db(process.env.DB_GAMES_DATABASE_NAME).collection(process.env.DB_GAMES_COLLECTION_NAME)
            const savedDocumentConfirmation = collection.insertOne(game)
            return savedDocumentConfirmation.insertedId
        })
        .catch(reason => console.error(reason))

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
                    firstPlayerToActByIndex: game.firstPlayerToActByIndex,
                    currentPlayerToActByIndex: game.currentPlayerToActByIndex
                }
            }, {upsert:true} )
            return savedDocumentConfirmation;
        })
        .catch(reason => console.error(reason))
}


module.exports.getGame = getGame;
module.exports.insertNewGame = insertNewGame;
module.exports.saveGame = saveGame;