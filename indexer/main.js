'use strict';

const config = require('config');
const IngredientsModel = require('../backend/models/ingredient_model.js');
const ProductModel = require('../backend/models/product_model.js');
const fs = require('fs');
const log = require('../backend/logger/logger.js').
    getLog('main.js');
const {connectionFactory} = require('../backend/models/connection_factory');
const StreamArray = require('stream-json/utils/StreamArray');
const MAX_PARALLEL_REQUESTS = config.get('maxParallelRequests');
let indexedDocuments = 0;

/**
 * Main-function, reads the models to index from the configuration and starts the indexing process.
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
  const startTime = new Date().getTime();
  for (let modelName of modelNames) {
    await chooseModelParseAsyncAndIndexJSON(modelName);
  }
  log.info('Indexing took:', new Date().getTime() - startTime, 'ms,', 'indexed:', indexedDocuments, 'documents');
  await connectionFactory.closeConnection();
})();

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
 * parsing that file asynchronously.
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
 * Parses the .json-file of the passed model asynchronously
 * and starts indexing the documents immediately after they have been parsed.
 * Only allows a configured amount of parallel requests. Awaits the requests if
 * that number is reached.
 * Resolves when all database-requests of the file were processed.
 * @param {Object} modelName name of the model, used for accessing .json file
 * @param {Object} model model which is used for the databaseAccess
 * @returns {Promise<boolean>} returns true if the indexer was successful or
 *  false if an error occured.
 */
async function parseFileAsyncAndIndex(model, modelName) {
  const pendingInsertRequests = [];
  const jsonStreamArray = StreamArray.make();
  try {
    const readStream = fs.createReadStream('./data/' + modelName + '.json');
    jsonStreamArray.output.on('readable', async () => {
      let document = jsonStreamArray.output.read();
      if (document) {
        if (pendingInsertRequests.length > MAX_PARALLEL_REQUESTS) {
          jsonStreamArray.input.pause();
          await Promise.all(pendingInsertRequests);
          pendingInsertRequests.length = 0;
          jsonStreamArray.input.resume();
        }
        indexedDocuments++;
        pendingInsertRequests.push(tryToInsertDocument(document.value, model));
      }
    });
    readStream.pipe(jsonStreamArray.input);
  } catch (err) {
    log.error({err: err});
    return false;
  }
  return new Promise((resolve, reject) => {
    jsonStreamArray.output.on('end', async () => {
      await Promise.all(pendingInsertRequests);
      resolve(true);
    });
    jsonStreamArray.output.on('error', err => reject(err));
  });
}
