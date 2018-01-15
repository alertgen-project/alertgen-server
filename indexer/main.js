'use strict';

const config = require('config');
const IngredientsModel = require('../backend/models/ingredient_model.js');
const ProductModel = require('../backend/models/product_model.js');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const log = require('../backend/logger/logger.js').
    getLog('main.js');
const {connectionFactory} = require('../backend/models/connection_factory');
const StreamArray = require('stream-json/utils/StreamArray');

/**
 * Main-function, gets the models to index and starts the indexing process.
 * Shuts the indexer down if establishing the initial connection failed.
 * Closes the database connection after the indexing process is done.
 */
(async () => {
  try {
    await connectionFactory.getConnection();
  } catch (err) {
    process.exit(1);
  }
  const modelNames = config.get('toIndex');
  let indexingMethod;
  if (config.get('asyncFileRead')) {
    indexingMethod = chooseModelParseAsyncAndIndexJSON;
    log.info('Starting to index with the asynchronous file-reading mode');
  } else {
    indexingMethod = chooseModelParseAndIndexJSON;
    log.info('Starting to index with the synchronous file-reading mode');
  }
  const startTime = new Date().getTime();
  for (let modelName of modelNames) {
    await indexingMethod(modelName);
  }
  log.info('Indexing took:', new Date().getTime() - startTime, 'ms');
  await connectionFactory.closeConnection();
})();

/**
 * Indexes a json-file with an array of documents into the database.
 * Parses the whole model-json-file before the indexing process for each model starts.
 * @param {string} modelName string-representation of the model-data which is to index. (filename without .json)
 * @returns {Promise<void>}
 */
async function chooseModelParseAndIndexJSON(modelName) {
  let documents;
  try {
    documents = JSON.parse(
        (await readFile('./data/' + modelName + '.json')).toString(
            'ascii'));
  } catch (err) {
    log.error({err: err});
    return;
  }
  let pendingInsertRequests;
  if (modelName === 'ingredients') {
    pendingInsertRequests = await indexDocuments(documents, IngredientsModel);
  }
  if (modelName === 'products') {
    pendingInsertRequests = await indexDocuments(documents, ProductModel);
  }
  await Promise.all(pendingInsertRequests);
  log.info('finished indexing: ' + modelName);
}

/**
 * Maps the passed documents to insert-requests towards the database and returns
 * an array containing the request-promises.
 * @param {Object} documents documents to index
 * @param {Object} model model which is used for the databaseAccess
 * @returns {Promise<Array>} Array with requests to resolve
 */
async function indexDocuments(documents, model) {
  return documents.map(document => {
    return tryToInsertDocument(document, model);
  });
}

/**
 * Tries to insert the passed document with help of the passed model
 * into the database
 * @param document document to insert
 * @param model model which servers as databaseAccess
 * @returns {Promise<boolean>} true if the insertion was successful, else false
 */
async function tryToInsertDocument(document, model) {
  try {
    await model.insert(document);
    log.info('indexed:', document.name);
    return true;
  } catch (err) {
    log.error({err: err});
    return false;
  }
}

/**
 * Indexes a json-file with an array of documents into the database while
 * parsing the file asynchronously.
 * @param {string} modelName string-representation of the model-data which is to index.
 *  (filename without .json)
 * @returns {Promise<void>}
 */
async function chooseModelParseAsyncAndIndexJSON(modelName) {
  try {
    if (modelName === 'ingredients') {
      await parseFileAsyncAndIndex(IngredientsModel, modelName);
    }
    if (modelName === 'products') {
      await parseFileAsyncAndIndex(ProductModel, modelName);
    }
    log.info('finished indexing: ' + modelName);
  } catch (err) {
    log.error({err: err});
  }
}

/**
 * Parses the json-file of the passed model with an array of documents asynchronously
 * and starts indexing those documents immediately after they have been parsed.
 * Resolves when all database-requests were processed.
 * @param {Object} modelName name of the model, used for accessing .json file
 * @param {Object} model model which is used for the databaseAccess
 * @returns {Promise<Array>} Array with booleans which show if the indexing of
 *  the different documents has been successful. null if parsing the json-file failed.
 */
async function parseFileAsyncAndIndex(model, modelName) {
  const pendingInsertRequests = [];
  const stream = StreamArray.make();
  try {
    stream.output.on('data', (document) => {
      if (document) {
        pendingInsertRequests.push(tryToInsertDocument(document.value, model));
      }
    });
    fs.createReadStream('./data/' + modelName + '.json').pipe(stream.input);
  } catch (err) {
    log.error({err: err});
    return null;
  }
  return new Promise((resolve, reject) => {
    stream.output.on('end', async () => {
      resolve(await Promise.all(pendingInsertRequests));
    });
    stream.output.on('error', err => reject(err));
  });
}
