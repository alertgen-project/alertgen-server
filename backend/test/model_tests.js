'use strict';
process.env.NODE_ENV = 'test';

require('chai').should();
const Ingredient = require('../models/ingredient_model');
const mongoose = require('mongoose');

describe('Ingredient Model Tests', () => {

  it('Should insert test-object, find it and remove it', async () => {
    (await Ingredient.insert({name: 'test'})).should.be.an('object');
    (await Ingredient.findOneIngredient({name: 'test'})).name.should.be.equal(
        'test');
    (await Ingredient.removeOne({name: 'test'})).should.be.an('object');
  });

  it('Should not find sugar and return false', async () => {
    const sugar = await Ingredient.updateIngredientAllergenConfirmation('sugar',
        'gluten',
        'contains_neg');
    sugar.should.be.false;
  });
});

after(() => {
  mongoose.connection.close();
});