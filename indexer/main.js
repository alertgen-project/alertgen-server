const config = require('config');

const IngredientsModel = require('../backend/models/ingredient_model.js');
const ProductModel = require('../backend/models/product_model.js');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const log = require('../backend/logger/logger.js').
    getLog('main.js');
const {connectionFactory} = require('../backend/models/connection_factory');

// "main-function"
(async () => {
  const modelsToIndex = config.get('toIndex');
  for (let model of modelsToIndex) {
    await index(model);
  }
  await connectionFactory.closeConnection();
})();

async function index(modelToIndex) {
  const documents = JSON.parse(
      (await readFile('./data/' + modelToIndex + '.json')).toString(
          'ascii'))[modelToIndex];
  let pendingDocs;
  if (modelToIndex === 'ingredients') {
    pendingDocs = await startIndexing(documents, IngredientsModel);
    console.log(pendingDocs);
  }
  if (modelToIndex === 'products') {
    pendingDocs = await startIndexing(documents, ProductModel);
    console.log(pendingDocs);
  }
  await waitForIndexing(pendingDocs);
  log.info('finished indexing: ' + modelToIndex);
}

async function startIndexing(documents, model) {
  const documentsWithRequests = [];
  for (let document of documents) {
    documentsWithRequests.push(
        {name: document.name, promise: tryToInsert(document, model)});
  }
  return documentsWithRequests;
}

async function tryToInsert(document, model) {
  try {
    await model.insert(document)
    log.info('indexed:', document.name);
    return true;
  } catch (err) {
    log.error(err);
    log.info('could not index:', document.name);
    return null;
  }
}

async function waitForIndexing(documents) {
  for (let document of documents) {
    await document.promise;
  }
}
