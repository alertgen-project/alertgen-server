'use strict';
require('chai').should();
const Ingredient = require('../models/ingredient_model');

describe('Ingredient Model Tests', () => {
  it('Should create sugar', async (done) => {
    const sugar = new Ingredient({
      name: 'sugar',
      gluten: {
        contains: false,
        contains_percent: 1,
        contains_pos: 0,
        contains_neg: 1,
      },
    });
    done();
  });

  it('Should insert test-object and remove it', async () => {
    (await Ingredient.insert({name: "test"})).should.be.true;
    (await Ingredient.removeOne({name: "test"})).should.be.true;
  });

  it('Should update sugar', async () => {
    (await Ingredient.updateIngredientAllergenConfirmation('sugar', 'gluten', 'contains_neg')).should.be.false;
  });
});
