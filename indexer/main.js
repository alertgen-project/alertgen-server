const config = require('config');

const IngredientsModel = require('../backend/models/ingredient_model.js');
const ProductModel = require('../backend/models/product_model.js');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const log = require('../backend/logger/logger.js').
    getLog('main.js');
const {connectionFactory} = require('../backend/models/connection_factory');

/**
 * Main-function, get the models which are to index and starts the indexing-process.
 * Closes the database after the indexing-process is done.
 */
(async () => {
  const modelsToIndex = config.get('toIndex');
  for (let model of modelsToIndex) {
    await indexJSON(model);
  }
  await connectionFactory.closeConnection();
})();

/**
 * Indexes a json-file with an array of documents into the database
 * @param {string} modelToIndex string-representation of the model-data which is to index.
 * is the same as the filename to parse and the key which stores the array of
 * documents to index in the json-file.
 * @returns {Promise<void>}
 */
async function indexJSON(modelToIndex) {
  const documents = JSON.parse(
      (await readFile('./data/' + modelToIndex + '.json')).toString(
          'ascii'))[modelToIndex];
  let pendingRequests;
  if (modelToIndex === 'ingredients') {
    pendingRequests= await startIndexing(documents, IngredientsModel);
  }
  if (modelToIndex === 'products') {
    pendingRequests = await startIndexing(documents, ProductModel);
  }
  await waitForIndexing(pendingRequests);
  log.info('finished indexing: ' + modelToIndex);
}

/**
 * Startes indexing the passed documents in a database with the help
 * of the passed model
 * @param {Object} documents documents to index
 * @param {Object} model model which is used for the databaseAccess
 * @returns {Promise<Array>} Array with Documents which have requests to resolve
 */
async function startIndexing(documents, model) {
  const documentsWithRequests = [];
  for (let document of documents) {
    documentsWithRequests.push(
        {name: document.name, promise: tryToInsert(document, model)});
  }
  return documentsWithRequests;
}

/**
 * Tries to insert the passed document with help of the passed model
 * into the database
 * @param document document to insert
 * @param model model which servers as databaseAccess
 * @returns {Promise<boolean>}
 */
async function tryToInsert(document, model) {
  try {
    await model.insert(document);
    log.info('indexed:', document.name);
    return true;
  } catch (err) {
    log.error(err);
    log.info('could not index:', document.name);
    return false;
  }
}

/**
 * Waits util the promises in the passed requestObjects are resolved
 * @param {Array<Object>} pendingRequests documents with promises to resolve
 * @returns {Promise<Object>} requestObjects with resolved requests
 */
async function waitForIndexing(pendingRequests) {
  for (let request of pendingRequests) {
    await request.promise;
  }
  return pendingRequests
}
