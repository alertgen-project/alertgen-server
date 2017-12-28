const config = require('config');

const IngredientsModel = require('../backend/models/ingredient_model.js');
const ProductModel = require('../backend/models/product_model.js');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const log = require('../backend/logger/logger.js').
    getLog('ingredient_model.js');

// "main-function"
(async() => {
  const modelsToIndex = config.get('toIndex');
  let indexed = 0;
  for (let model of modelsToIndex){
      await index(model);
  }
})();

async function index(modelToIndex) {
  const documents = JSON.parse(
      (await readFile('./data/' + modelToIndex + '.json')).toString(
          'ascii'))[modelToIndex];
  if (modelToIndex === 'ingredients') {
    await indexIngredients(documents);
  }
  if (modelToIndex === 'products') {
    await indexProducts(documents);
  }
}

async function indexProducts(documents){
  for (let document of documents) {
    try {
      await ProductModel.insert(document);
    } catch (err) {
      log.error(err);
      log.info('could not index', document.name);
    }
  }
}

async function indexIngredients(documents){
  for (let document of documents) {
    try {
      await IngredientsModel.insert(document);
    } catch (err) {
      log.error(err);
      log.info('could not index', document.name);
    }
  }
}
