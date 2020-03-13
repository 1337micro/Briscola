"use strict";
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DB_HOST_PREFIX + process.env.DB_USER +":" + process.env.DB_PASS+ "@" + process.env.DB_HOST_SUFFIX;
const client = new MongoClient(uri, { useNewUrlParser: true });


async function getGame(id)
{
    return client.connect()
        .then(client => {
            const collection = client.db(process.env.DB_GAMES_DATABASE_NAME).collection(process.env.DB_GAMES_COLLECTION_NAME)
            return collection.findOne({_id: id})
        })
        .catch(reason => console.error(reason))
}

/**
 * Insert a new game and return its ID to persist in user session
 * @param game
 * @returns {Promise<String>} the ID of the saved document
 */
async function insertNewGame(game)
{
    return client.connect()
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
    return client.connect()
        .then(client => {
            const collection = client.db(process.env.DB_GAMES_DATABASE_NAME).collection(process.env.DB_GAMES_COLLECTION_NAME)
            const savedDocumentConfirmation = collection.save(game)
            return savedDocumentConfirmation.insertedId
        })
        .catch(reason => console.error(reason))
}


module.exports.getGame = getGame;
module.exports.insertNewGame = insertNewGame;
module.exports.saveGame = saveGame;