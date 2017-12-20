'use strict';
process.env.NODE_ENV = 'test';

require('chai').should();
const {getIngredientsModel} = require('../models/ingredient_model');
const {connectionFactory} = require('../models/connection_factory');

describe('Ingredient Model Tests', () => {

  it('Should insert test-object, find it, update it and remove it',
      async () => {
        const model = await getIngredientsModel();
        (await model.insert({name: 'test'})).name.should.be.equal(
            'test');
        (await model.findOneIngredient({name: 'test'})).name.should.be.equal(
            'test');
        (await model.removeOne({name: 'test'})).name.should.be.equal(
            'test');
      });

  it('Should not find sugar and return false', async () => {
    const model = await getIngredientsModel();
    const sugar = await model.updateIngredientAllergenConfirmation('sugar',
        'gluten',
        'contains_neg');
    sugar.should.be.false;
  });
});

after(() => {
  connectionFactory.closeConnection();
});
