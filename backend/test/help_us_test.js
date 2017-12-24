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
;

describe('ingredients', () => {
  describe(
      '/POST /helpus?ingredient=' + testIngredientName +
      '&allergen=gluten&contains=false',
      () => {
        it('it insert and update a testingredient', (done) => {
          chai.request(server).
              post('/helpus').
              query({
                ingredient: testIngredientName,
                allergen: 'gluten',
                contains: false,
              }).
              end((err, res) => {
                res.should.be.a.json;
                res.should.have.status(200);
                findOneIngredientFuzzy(testIngredientName).
                    then((ingredient) => {
                      ingredient.name.should.be.equal(testIngredientName);
                      ingredient.gluten.contains.should.be.false;
                      done();
                    }).
                    catch(err => done(err));
              });
        });
      });
});

beforeEach(async () => {
  // make sure created objects are not in the database anymore
  await insert(testIngredient);
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
