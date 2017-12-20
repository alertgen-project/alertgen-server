'use strict';
process.env.NODE_ENV = 'test';

require('chai').should();
const IngredientsModel = require('../models/ingredient_model');
const {connectionFactory} = require('../models/connection_factory');

describe('Ingredient Model Tests', () => {

  it('Should insert test-object, find it, update it and remove it',
      async () => {
        (await IngredientsModel.insert({name: 'test'})).name.should.be.equal(
            'test');
        (await IngredientsModel.findOne({name: 'test'})).name.should.be.equal(
            'test');
        (await IngredientsModel.findByName('test'))[0].name.should.be.equal(
            'test');
        (await IngredientsModel.removeOne({name: 'test'})).name.should.be.equal(
            'test');
      });

  it('Should not find sugar and return false', async () => {
    const model = await IngredientsModel.getIngredientsModel();
    const sugar = await model.updateIngredientAllergenConfirmation('sugar',
        'gluten',
        'contains_neg');
    sugar.should.be.false;
  });
});

after(() => {
  connectionFactory.closeConnection();
});
