process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiHttp);
chai.use(chaiAsPromised);
chai.should();
const server = require('../server.js');
const IngredientsErrors = require('../errors/ingredients_errors.js');
const {connectionFactory} = require('../models/connection_factory');
const {insert, findOneIngredientFuzzy, removeOne, Ingredient} = require(
    '../models/ingredient_model');

const testIngredientName = '4564456456test435345345';
const testIngredient = new Ingredient({name: testIngredientName});

describe('ingredients', () => {

  describe(
      '/POST /helpus?ingredient=' + testIngredientName +
      '&allergen=gluten&contains=false',
      () => {
        it('it insert a ingredient manually and updates this inserted' +
            ' testingredient', async () => {
          await insert(testIngredient);
          const res = await chai.request(server).
              post('/helpus').
              query({
                ingredient: testIngredientName,
                allergen: 'gluten',
                contains: false,
              });
          res.should.be.a.json;
          res.should.have.status(200);
          const ingredient = await findOneIngredientFuzzy(testIngredientName);
          ingredient.name.should.be.equal(testIngredientName);
          ingredient.gluten.contains.should.be.false;
          ingredient.gluten.contains_neg.should.be.equal(1);
          ingredient.gluten.contains_percent.should.be.equal(0);
        });
      });

  describe(
      '/POST /helpus?ingredient=' + testIngredientName +
      '&allergen=gluten&contains=false',
      () => {
        it('it should ' +
            'insert and update a testingredient automatically', async () => {
          const res = await chai.request(server).
              post('/helpus').
              query({
                ingredient: testIngredientName,
                allergen: 'gluten',
                contains: false,
              });
          res.should.be.a.json;
          res.should.have.status(200);
          const ingredient = await findOneIngredientFuzzy(testIngredientName);
          ingredient.name.should.be.equal(testIngredientName);
          ingredient.gluten.contains.should.be.false;
          ingredient.gluten.contains_neg.should.be.equal(1);
          ingredient.gluten.contains_percent.should.be.equal(0);
        });
      });

  describe(
      '/POST /helpus?ingredient=' + testIngredientName +
      '&allergen=gluten&contains=true x10 times and false x7 times',
      () => {
        it('tests parallel /helpus-calls', async () => {
          await Promise.all(
              getHelpusRequests(10, testIngredientName, 'gluten', true));
          let ingredient = await findOneIngredientFuzzy(testIngredientName);
          ingredient.name.should.be.equal(testIngredientName);
          ingredient.gluten.contains.should.be.true;
          ingredient.gluten.contains_neg.should.be.equal(0);
          ingredient.gluten.contains_pos.should.be.equal(10);
          ingredient.gluten.contains_percent.should.be.equal(1);
          await Promise.all(
              getHelpusRequests(7, testIngredientName, 'gluten', false));
          ingredient = await findOneIngredientFuzzy(testIngredientName);
          ingredient.gluten.contains.should.be.true;
          ingredient.gluten.contains_neg.should.be.equal(7);
          ingredient.gluten.contains_pos.should.be.equal(10);
          ingredient.gluten.contains_percent.should.be.equal(10 / 17);
        });
      });

  function getHelpusRequests(count, name, allergen, contains) {
    const requests = [];
    for (let i = 0; i < count; i++) {
      requests.push(chai.request(server).
          post('/helpus').
          query({
            ingredient: name,
            allergen: allergen,
            contains: contains,
          }));
    }
    return requests;
  }
});

beforeEach(async () => {
  // make sure created objects are not in the database anymore
});

afterEach(async () => {
  // make sure created objects are not in the database anymore
  await removeOne({name: testIngredientName});
});

after(() => {
  server.close(() => {
    this.connectionFactory.closeConnection();
  });
});
