'use strict';
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
const IngredientsModel = require('../models/ingredient_model');
const {connectionFactory} = require('../models/connection_factory');

const testFruitName = '7357f2u17';
const testFruitUpdate = {
  name: testFruitName, gluten: {
    contains: false,
    contains_percent: 0,
    contains_pos: 0,
    contains_neg: 0,
  },
};
const testFruitCRUD = {
  name: testFruitName, gluten: {
    contains: false,
    contains_percent: 1 / 12,
    contains_pos: 1,
    contains_neg: 12,
  },
};

describe('Ingredient Model Tests', () => {

  it('Should insert a test-object, find it, update it and remove it',
      async () => {
        (await IngredientsModel.insert(testFruitCRUD)).name.should.be.equal(
            testFruitName);
        (await IngredientsModel.findByName(
            testFruitName))[0].name.should.be.equal(
            testFruitName);
        (await IngredientsModel.findOneIngredientFuzzy(
            testFruitName)).name.should.be.equal(
            testFruitName);
        (await IngredientsModel.increaseIngredientAllergen(
            testFruitName, 'gluten')).name.should.be.equal(
            testFruitName);
        (await IngredientsModel.findOneIngredientFuzzy(
            testFruitName)).gluten.contains_pos.should.be.equal(
            2);
        (await IngredientsModel.decreaseIngredientAllergen(
            testFruitName, 'gluten', 'contains_neg')).name.should.be.equal(
            testFruitName);
        (await IngredientsModel.findOneIngredientFuzzy(
            testFruitName)).gluten.contains_neg.should.be.equal(
            13);
        (await IngredientsModel.removeOne(
            {name: testFruitName})).name.should.be.equal(
            testFruitName);
      });

  it('Should update in parallel and return docs with the correct values',
      async () => {
        const allergen = 'gluten';
        let resultAllergen;
        (await IngredientsModel.insert(testFruitUpdate)).name.should.be.equal(
            testFruitName);
        resultAllergen = (await IngredientsModel.increaseIngredientAllergen(
            testFruitName, allergen))[allergen];
        resultAllergen.contains.should.be.true;
        resultAllergen.contains_pos.should.be.equal(1);
        resultAllergen.contains_percent.should.be.equal(1);
        await Promise.all(getDecreaseUpdateRequests(5, testFruitName));
        resultAllergen = (await IngredientsModel.findOneIngredientFuzzy(
            testFruitName))[allergen];
        resultAllergen.contains.should.be.false;
        resultAllergen.contains_pos.should.be.equal(1);
        resultAllergen.contains_neg.should.be.equal(5);
        resultAllergen.contains_percent.should.be.equal(1 / (1 + 5));
        await Promise.all(getIncreaseUpdateRequests(7, testFruitName));
        resultAllergen = (await IngredientsModel.findOneIngredientFuzzy(
            testFruitName))[allergen];
        resultAllergen.contains.should.be.true;
        resultAllergen.contains_pos.should.be.equal(8);
        resultAllergen.contains_neg.should.be.equal(5);
        resultAllergen.contains_percent.should.be.equal(8 / (8 + 5));
        (await IngredientsModel.removeOne(
            {name: testFruitName})).name.should.be.equal(
            testFruitName);
      });

  it('Update should return false if no doc has been found', async () => {
    const hopefullyNotInDatabase = 'X44FKbUVXwUW6LeWtvdL';
    (await IngredientsModel.increaseIngredientAllergen(
        hopefullyNotInDatabase, hopefullyNotInDatabase)).should.be.false;
  });

  it('Should throw an error if something with the same name is inserted twice',
      async () => {
        (await IngredientsModel.insert({name: testFruitName}));
        IngredientsModel.insert({name: testFruitName}).
            should.
            eventually.
            throw();
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
  await IngredientsModel.removeOne({name: testFruitName});
});

after(() => {
  connectionFactory.closeConnection();
});
