const config = require('config');

const IngredientsModel = require('../backend/models/ingredient_model.js');
const ProductModel = require('../backend/models/product_model.js');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const modelsToIndex = config.get('toIndex');
const log = require('../backend/logger/logger.js').
    getLog('ingredient_model.js');
const {connectionFactory} = require('../backend/models/connection_factory');

let indexed = 0;

modelsToIndex.forEach(async (model) => {
  index(model).then(async () => {
    indexed++;
    if (indexed === modelsToIndex.length) {
      await connectionFactory.closeConnection();
    }
  }).catch((err) => {
    console.err(err);
  });
});

async function index(modelToIndex) {
  const documents = JSON.parse(
      (await readFile('./data/' + modelToIndex + '.json')).toString(
          'ascii'))[modelToIndex];
  if (modelToIndex === 'ingredients') {

  }
  if (modelToIndex === 'products') {
    await indexProducts(documents);
  }
}

async function indexProducts(documents){
  for (let document of documents) {
    try {
      return await ProductModel.insert(document);
    } catch (err) {
      log.error(err);
      log.info('could not index', document.name);
      return;
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
