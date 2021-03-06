'use strict';
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
const IngredientsModel = require('../models/ingredient_model');
const ProductModel = require('../models/product_model');
const {connectionFactory} = require('../models/connection_factory');
const {getRandomInt} = require('./test_util');

const testIngredientName = '7357f2u17' +
    getRandomInt(0, 10000000);
;
const testIngredientUpdate = new IngredientsModel.Ingredient(
    {name: testIngredientName});
const testIngredientCRUD = {
  name: testIngredientName, gluten: {
    contains: false,
    contains_percent: 1 / 12,
    contains_pos: 1,
    contains_neg: 12,
  },
};

const testCategory = 'testpizza';
const testProduct = {
  barcode: '123120000',
  name: 'pizza ristorante',
  ingredients: ['wheat', 'water', 'tomato'],
  categories: [testCategory],
};
const testCategory2 = 'testpasta';
const testProduct2 = {
  barcode: '123122222',
  name: 'spaghetti dinkel',
  ingredients: ['wheat', 'water'],
  categories: [testCategory2],
};

describe('Ingredient Model Tests', () => {

  it('Should insert a test-object, find it, update it and remove it',
      async () => {
        (await IngredientsModel.insert(
            testIngredientCRUD)).name.should.be.equal(
            testIngredientName);
        (await IngredientsModel.findByName(
            testIngredientName))[0].name.should.be.equal(
            testIngredientName);
        (await IngredientsModel.findOneIngredientFuzzy(
            testIngredientName)).name.should.be.equal(
            testIngredientName);
        (await IngredientsModel.increaseIngredientAllergen(
            testIngredientName, 'gluten')).name.should.be.equal(
            testIngredientName);
        (await IngredientsModel.findOneIngredientFuzzy(
            testIngredientName)).gluten.contains_pos.should.be.equal(
            2);
        (await IngredientsModel.decreaseIngredientAllergen(
            testIngredientName, 'gluten', 'contains_neg')).name.should.be.equal(
            testIngredientName);
        (await IngredientsModel.findOneIngredientFuzzy(
            testIngredientName)).gluten.contains_neg.should.be.equal(
            13);
        (await IngredientsModel.removeOne(
            {name: testIngredientName})).name.should.be.equal(
            testIngredientName);
      });

  it('Should update in parallel and return docs with the correct values',
      async () => {
        const allergen = 'gluten';
        let resultAllergen;
        (await IngredientsModel.insert(
            testIngredientUpdate)).name.should.be.equal(
            testIngredientName);
        resultAllergen = (await IngredientsModel.increaseIngredientAllergen(
            testIngredientName, allergen))[allergen];
        resultAllergen.contains.should.be.true;
        resultAllergen.contains_pos.should.be.equal(1);
        resultAllergen.contains_percent.should.be.equal(1);
        await Promise.all(getDecreaseUpdateRequests(5, testIngredientName));
        resultAllergen = (await IngredientsModel.findOneIngredientFuzzy(
            testIngredientName))[allergen];
        resultAllergen.contains.should.be.false;
        resultAllergen.contains_pos.should.be.equal(1);
        resultAllergen.contains_neg.should.be.equal(5);
        resultAllergen.contains_percent.should.be.equal(1 / (1 + 5));
        await Promise.all(getIncreaseUpdateRequests(7, testIngredientName));
        resultAllergen = (await IngredientsModel.findOneIngredientFuzzy(
            testIngredientName))[allergen];
        resultAllergen.contains.should.be.true;
        resultAllergen.contains_pos.should.be.equal(8);
        resultAllergen.contains_neg.should.be.equal(5);
        resultAllergen.contains_percent.should.be.equal(8 / (8 + 5));
        (await IngredientsModel.removeOne(
            {name: testIngredientName})).name.should.be.equal(
            testIngredientName);
      });

  it('Update should return false if no doc has been found', async () => {
    const hopefullyNotInDatabase = 'X44FKbUVXwUW6LeWtvdL';
    (await IngredientsModel.increaseIngredientAllergen(
        hopefullyNotInDatabase, hopefullyNotInDatabase)).should.be.false;
  });

  it('Should throw an error if something with the same name is inserted twice',
      async () => {
        (await IngredientsModel.insert({name: testIngredientName}));
        IngredientsModel.insert({name: testIngredientName}).
            should.
            eventually.
            throw();
      });
});

describe('Product Model Tests', () => {

  describe(
      'insert, findOneByBarcode, findProductsOfCategory and removeOne tests',
      () => {
        it('Should insert a test product, find it by barcode, find it by category and remove it',
            async () => {
              (await ProductModel.insert(testProduct)).barcode.should.be.equal(
                  '123120000');
              (await ProductModel.findOneByBarcode(
                  '123120000')).barcode.should.be.equal('123120000');
              (await ProductModel.findProductsOfCategory(
                  testCategory))[0].barcode.should.be.equal('123120000');
              (await ProductModel.removeOne(
                  testProduct)).barcode.should.be.equal('123120000');
            });
      });
  describe(
      'Error tests',
      () => {
        it('Should throw an error if the same product is inserted twice',
            async () => {
              (await ProductModel.insert(testProduct)).barcode.should.be.equal(
                  '123120000');
              ProductModel.insert(testProduct).should.eventually.throw();
              (await ProductModel.removeOne(
                  testProduct)).barcode.should.be.equal(
                  '123120000');
            });
      });
  describe(
      'insert, findOne, and removeOne tests',
      () => {
        it('should insert a product and find it with findOne() and remove it',
            async () => {
              (await ProductModel.insert(testProduct2)).barcode.should.be.equal(
                  '123122222');
              (await ProductModel.findOne(
                  testProduct2)).barcode.should.be.equal(
                  '123122222');
              (await ProductModel.removeOne(
                  testProduct2)).barcode.should.be.equal(
                  '123122222');
            });
      });
});

function getIncreaseUpdateRequests(numberOfRequests, ingredientName) {
  const updateRequests = [];
  for (let i = 0; i < numberOfRequests; i++) {
    updateRequests.push((IngredientsModel.increaseIngredientAllergen(
        ingredientName, 'gluten')));
  }
  return updateRequests;
}

function getDecreaseUpdateRequests(numberOfRequests, ingredientName) {
  const updateRequests = [];
  for (let i = 0; i < numberOfRequests; i++) {
    updateRequests.push((IngredientsModel.decreaseIngredientAllergen(
        ingredientName, 'gluten')));
  }
  return updateRequests;
}

afterEach(async () => {
  // make sure created objects are not in the database anymore
  await IngredientsModel.removeOne({name: testIngredientName});
});

after((done) => {
  ProductModel.removeOne(testProduct).then(() => {
    ProductModel.removeOne(testProduct2).then(() => {
      connectionFactory.closeConnection();
      done();
    });
  });
});
