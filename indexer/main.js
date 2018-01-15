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
const MAX_PARALLEL_REQUESTS = config.get('maxParallelRequests');

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
 * Parses the whole model.json-file before the indexing process for each model starts.
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
 * Maps the passed documents to insert-requests and returns
 * the array which contains the request-promises.
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
 * Parses the .json-file of the passed model asynchronously
 * and starts indexing the documents immediately after they have been parsed.
 * Only allows a configured amount of parallel requests. Awaits the requests if
 * that number is reached.
 * Resolves when all database-requests of the file were processed.
 * @param {Object} modelName name of the model, used for accessing .json file
 * @param {Object} model model which is used for the databaseAccess
 * @returns {Promise<boolean>} returns true if the indexer is finished
 */
async function parseFileAsyncAndIndex(model, modelName) {
  const pendingInsertRequests = [];
  const stream = StreamArray.make();
  const readStream = fs.createReadStream('./data/' + modelName + '.json');
  try {
    stream.output.on('readable', async () => {
      let document = stream.output.read();
      if (document) {
        if(pendingInsertRequests.length > MAX_PARALLEL_REQUESTS){
          stream.input.pause();
          await Promise.all(pendingInsertRequests);
          pendingInsertRequests.length = 0;
          stream.input.resume();
        }
        pendingInsertRequests.push(tryToInsertDocument(document.value, model));
      }
    });
    readStream.pipe(stream.input);
  } catch (err) {
    log.error({err: err});
    return null;
  }
  return new Promise((resolve, reject) => {
    stream.output.on('end', async () => {
      await Promise.all(pendingInsertRequests);
      resolve(true);
    });
    stream.output.on('error', err => reject(err));
  });
}
