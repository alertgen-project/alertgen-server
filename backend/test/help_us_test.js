'use strict';
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiHttp);
chai.use(chaiAsPromised);
chai.should();
const server = require('../server.js');
const HelpUsErrors = require('../errors/help_us_errors.js');
const {connectionFactory} = require('../models/connection_factory');
const {insert, findOneIngredientFuzzy, removeOne, Ingredient} = require(
    '../models/ingredient_model');
const {getRandomInt} = require('./test_util');

const notAvailableParameter = 'FAIL';
const testIngredientName = '4564456456test435345345' +
    getRandomInt(0, 10000000);
const testIngredient = new Ingredient({name: testIngredientName});

describe('ingredients', () => {

  describe(
      '/POST /helpus?ingredient=' + testIngredientName +
      '&allergen=gluten&contains=false',
      () => {
        it('it inserts a ingredient manually and updates this inserted' +
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
      '&allergen=gluten&contains=true',
      () => {
        it('tests parallel /helpus-calls', async () => {
          let responses = await Promise.all(
              getHelpusRequests(10, testIngredientName, 'gluten', true));
          responses.forEach((response) => {
            response.should.have.status(200);
            response.should.be.a.json;
          });
          let ingredient = await findOneIngredientFuzzy(testIngredientName);
          ingredient.name.should.be.equal(testIngredientName);
          ingredient.gluten.contains.should.be.true;
          ingredient.gluten.contains_neg.should.be.equal(0);
          ingredient.gluten.contains_pos.should.be.equal(10);
          ingredient.gluten.contains_percent.should.be.equal(1);
          responses = await Promise.all(
              getHelpusRequests(7, testIngredientName, 'gluten', false));
          responses.forEach((response) => {
            response.should.have.status(200);
            response.should.be.a.json;
          });
          ingredient = await findOneIngredientFuzzy(testIngredientName);
          ingredient.gluten.contains.should.be.true;
          ingredient.gluten.contains_neg.should.be.equal(7);
          ingredient.gluten.contains_pos.should.be.equal(10);
          ingredient.gluten.contains_percent.should.be.equal(10 / 17);
          responses = await Promise.all(
              getHelpusRequests(4, testIngredientName, 'gluten', false));
          responses.forEach((response) => {
            response.should.have.status(200);
            response.should.be.a.json;
          });
          ingredient = await findOneIngredientFuzzy(testIngredientName);
          ingredient.gluten.contains.should.be.false;
          ingredient.gluten.contains_neg.should.be.equal(11);
          ingredient.gluten.contains_pos.should.be.equal(10);
          ingredient.gluten.contains_percent.should.be.equal(10 / 21);
          responses = (await Promise.all(
              getHelpusRequests(4, testIngredientName, 'eggs', false)));
          responses.forEach((response) => {
            response.should.have.status(200);
            response.should.be.a.json;
          });
          ingredient = await findOneIngredientFuzzy(testIngredientName);
          ingredient.eggs.contains.should.be.false;
          ingredient.eggs.contains_neg.should.be.equal(4);
          ingredient.eggs.contains_pos.should.be.equal(0);
          ingredient.eggs.contains_percent.should.be.equal(0);
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

  describe(
      '/GET /helpus', () => {
        it('do not allow GET', (done) => {
          chai.request(server).
              get('/helpus').
              end((err, res) => {
                res.should.have.status(405);
                done();
              });
        });
      });

  describe(
      '/POST /helpus', () => {
        it('it should respond with an error message', (done) => {
          chai.request(server).
              post('/helpus').
              end((err, res) => {
                res.should.have.status(400);
                (res.text.length > 40).should.be.true;
                res.text.should.equal(
                    new HelpUsErrors.HelpUsWrongParameterError().template);
                done();
              });
        });
      });

  describe(
      '/POST /helpus?ingredient=' + testIngredientName, () => {
        it('it should respond with an error message', (done) => {
          chai.request(server).
              post('/helpus').
              query({
                ingredient: testIngredientName,
              }).
              end((err, res) => {
                res.should.have.status(400);
                (res.text.length > 40).should.be.true;
                res.text.should.equal(
                    new HelpUsErrors.HelpUsWrongParameterError().template);
                done();
              });
        });
      });

  describe(
      '/POST /helpus?ingredient=' + testIngredientName +
      '&allergen=gluten&contains=' + notAvailableParameter, () => {
        it('it should respond with an error message', (done) => {
          chai.request(server).
              post('/helpus').
              query({
                ingredient: testIngredientName,
                allergen: 'gluten',
                contains: notAvailableParameter,
              }).
              end((err, res) => {
                res.should.have.status(400);
                (res.text.length > 40).should.be.true;
                res.text.should.equal(
                    new HelpUsErrors.ContainsWrongParameterError().template);
                done();
              });
        });
      });

  describe(
      '/POST /helpus?ingredient=' + testIngredientName +
      '&allergen=' + notAvailableParameter + '&contains=true', () => {
        it('it should respond with an error message', (done) => {
          chai.request(server).
              post('/helpus').
              query({
                ingredient: testIngredientName,
                allergen: notAvailableParameter,
                contains: 'true',
              }).
              end((err, res) => {
                res.should.have.status(404);
                (res.text.length > 40).should.be.true;
                res.text.should.equal(
                    'The allergen you requested with the name "' +
                    notAvailableParameter + '" is not listed in our database.');
                done();
              });
        });
      });
});

afterEach(async () => {
  // make sure created objects are not in the database anymore
  await removeOne({name: testIngredientName});
});

after(() => {
  server.close(() => {
    connectionFactory.closeConnection();
  });
});
