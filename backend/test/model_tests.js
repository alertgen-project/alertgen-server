'use strict';
process.env.NODE_ENV = 'test';

require('chai').should();
const IngredientsModel = require('../models/ingredient_model');
const {connectionFactory} = require('../models/connection_factory');

const testFruitNameCRUD = 'testfruit123';
const testFruitCRUD = {
  name: testFruitNameCRUD, gluten: {
    contains: false,
    contains_percent: 1 / 12,
    contains_pos: 1,
    contains_neg: 12,
  },
};
const testFruitNameUpdate = 'updatefruit';
const testFruitUpdate = {
  name: testFruitNameUpdate, gluten: {
    contains: false,
    contains_percent: 0,
    contains_pos: 0,
    contains_neg: 0,
  },
};


describe('Ingredient Model Tests', () => {

  it('Should insert test-object, find it, update it and remove it',
      async () => {
        (await IngredientsModel.insert(testFruitCRUD)).name.should.be.equal(
            testFruitNameCRUD);
        (await IngredientsModel.findByName(
            testFruitNameCRUD))[0].name.should.be.equal(
            testFruitNameCRUD);
        (await IngredientsModel.findOneIngredientFuzzy(
            testFruitNameCRUD)).name.should.be.equal(
            testFruitNameCRUD);
        (await IngredientsModel.increaseIngredientAllergen(
            testFruitNameCRUD, 'gluten')).name.should.be.equal(
            testFruitNameCRUD);
        (await IngredientsModel.findOneIngredientFuzzy(
            testFruitNameCRUD)).gluten.contains_pos.should.be.equal(
            2);
        (await IngredientsModel.decreaseIngredientAllergen(
            testFruitNameCRUD, 'gluten', 'contains_neg')).name.should.be.equal(
            testFruitNameCRUD);
        (await IngredientsModel.findOneIngredientFuzzy(
            testFruitNameCRUD)).gluten.contains_neg.should.be.equal(
            13);
        (await IngredientsModel.removeOne(
            {name: testFruitNameCRUD})).name.should.be.equal(
            testFruitNameCRUD);
      });

  it('Should test update in depth', async () => {
    (await IngredientsModel.insert(testFruitUpdate)).name.should.be.equal(
        testFruitNameUpdate);
    (await IngredientsModel.increaseIngredientAllergen(
        testFruitNameUpdate, 'gluten')).gluten.contains.should.be.true;
    await Promise.all(getDecreaseUpdateRequests(5, testFruitNameUpdate));
    const ing = (await IngredientsModel.findOneIngredientFuzzy(
        testFruitNameUpdate));
    console.log(ing);
    (await IngredientsModel.removeOne(
        {name: testFruitNameUpdate})).name.should.be.equal(
        testFruitNameUpdate);
  });

});

function getIncreaseUpdateRequests(numberOfRequests, ingredientName){
  const updateRequests = [];
  for (let i = 0; i < numberOfRequests; i++) {
    updateRequests.push((IngredientsModel.increaseIngredientAllergen(
        ingredientName, 'gluten')));
  }
  return updateRequests
}

function getDecreaseUpdateRequests(numberOfRequests, ingredientName){
  const updateRequests = [];
  for (let i = 0; i < numberOfRequests; i++) {
    updateRequests.push((IngredientsModel.decreaseIngredientAllergen(
        ingredientName, 'gluten')));
  }
  return updateRequests
}

afterEach(async () => {
  // make sure created objects are not in the database anymore
  await IngredientsModel.removeOne({name: testFruitNameCRUD});
  await IngredientsModel.removeOne({name: testFruitNameUpdate});
});

after(() => {
  connectionFactory.closeConnection();
});
