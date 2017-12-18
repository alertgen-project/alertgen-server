'use strict';
const config = require('config');
const mongoose = require('mongoose');
const IngredientSchema = require('../models/ingredient_model');

const conn = mongoose.connect('mongodb://' + config.get('db.user') + ':' +
    config.get('db.pw') + '@' + config.get('db.host') + ':' +
    config.get('db.port'),
    {useMongoClient: true});
// use ES6 native Promises
mongoose.Promise = Promise;

const Ingredient = conn.model('Ingredient', IngredientSchema);

describe('Ingredient Model Tests', () => {
  it('Should create water', async (done) => {
    const water = new Ingredient({
      name: 'water',
      gluten: {
        contains: false,
        contains_percent: 1,
        contains_pos: 0,
        contains_neg: 1,
      },
    });
    console.log(water);
    done();
  });

  it('Should update water', async (done) => {
    const water2 = Ingredient.findByName('water');
    console.log(water2);
    done();
  });

});