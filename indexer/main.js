const config = require('config');

const IngredientsModel = require('../backend/models/ingredient_model.js');
const ProductModel = require('../backend/models/product_model.js')
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const modelsToIndex = config.get('toIndex');
const log = require('../backend/logger/logger.js').
    getLog('ingredient_model.js');
const {connectionFactory} = require('../backend/models/connection_factory');

let indexed = 0;

modelsToIndex.forEach((model) => {
  index(model).then(async () => {
    indexed++;
    if (indexed === modelsToIndex.length) {
      await connectionFactory.closeConnection();
    }
  });
});

async function index(modelToIndex) {
  const documents = JSON.parse(
      (await readFile('./data/products.json')).toString('ascii'))[modelToIndex];
  if (modelToIndex === 'ingredients') {
    documents.forEach(async (ingredient) => {
      try {
        await IngredientsModel.insert(ingredient);
      } catch (err) {
        log.error(err);
        console.error(err);
      }
    });
  }
  if (modelToIndex === 'products') {
    documents.forEach(async (doc) => {
      try {
        await ProductModel.insert(doc);
      } catch(err) {
        log.error(err);
        console.error(err);
      }
    });
  }
}
