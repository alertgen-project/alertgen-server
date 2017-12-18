'use strict';
require('chai').should();
const Ingredient = require('../models/ingredient_model');

describe('Ingredient Model Tests', () => {
  it('Should create water', async (done) => {
    const sugar = new Ingredient({
      name: 'sugar',
      gluten: {
        contains: false,
        contains_percent: 1,
        contains_pos: 0,
        contains_neg: 1,
      },
    });
    console.log(sugar);
    done();
  });

  it('Should update water', async (done) => {
    const water2 = await Ingredient.findByName('sugar');
    console.log(water2);
    done();
  });

});