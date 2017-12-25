process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server.js');
const IngredientsErrors = require('../errors/ingredients_errors.js');
const {connectionFactory} = require('../models/connection_factory');

chai.use(chaiHttp);

describe('ingredients', () => {
  describe(
      '/GET /ingredients?ingredients=DelicousPancakeDough&allergens=gluten',
      () => {
        it('it should GET the requested ingredients', (done) => {
          chai.request(server).
              get('/ingredients').
              query({ingredients: 'DelicousPancakeDough', allergens: 'gluten'}).
              end((err, res) => {
                res.should.be.a.json;
                res.should.have.status(200);
                res.body[0].DelicousPancakeDough.gluten.containing.should.be.true;
                done();
              });
        });
      });
  describe(
      '/GET /ingredients?ingredients=DelicousPancakeDough&ingredients=DelicousPickle&allergens=gluten',
      () => {
        it('it should GET the requested ingredients', (done) => {
          chai.request(server).
              get('/ingredients').
              query({
                ingredients: ['DelicousPancakeDough', 'DelicousPickle'],
                allergens: 'gluten',
              }).
              end((err, res) => {
                res.should.be.a.json;
                res.should.have.status(200);
                res.body[0].DelicousPancakeDough.gluten.containing.should.be.true;
                res.body[1].DelicousPickle.gluten.containing.should.be.false;
                done();
              });
        });
      });
  describe(
      '/GET /ingredients?ingredients=sushimi&allergens=molluscs&allergens=gluten',
      () => {
        it('it should GET the requested ingredients', (done) => {
          chai.request(server).
              get('/ingredients').
              query({
                ingredients: ['sushimi'],
                allergens: ['molluscs', 'gluten'],
              }).
              end((err, res) => {
                res.should.be.a.json;
                res.should.have.status(200);
                res.body[0].sushimi.molluscs.containing.should.be.true;
                res.body[0].sushimi.molluscs.contains_percent.should.equal(
                    0.7);
                res.body[0].sushimi.gluten.containing.should.be.false;
                res.body[0].sushimi.gluten.contains_percent.should.equal(
                    0);
                done();
              });
        });
      });
  describe(
      '/GET /ingredients?ingredients=DelicousPickle2&allergens=gluten&allergens=lupin',
      () => {
        it('it should GET the requested ingredients', (done) => {
          chai.request(server).
              get('/ingredients').
              query({
                ingredients: 'DelicousPickle2',
                allergens: ['gluten', 'lupin'],
              }).
              end((err, res) => {
                res.should.be.a.json;
                res.should.have.status(200);
                res.body[0].DelicousPickle2.gluten.containing.should.be.false;
                res.body[0].DelicousPickle2.lupin.containing.should.be.false;
                done();
              });
        });
      });
  describe(
      '/GET /ingredients',
      () => {
        it('it should return an error message', (done) => {
          chai.request(server).
              get('/ingredients').
              end((err, res) => {
                res.should.have.status(400);
                (res.text.length > 40).should.be.true;
                res.text.should.equal(new IngredientsErrors.
                    IngredientsWrongParameterError().template);
                done();
              });
        });
      });
  describe(
      '/GET /ingredients?ingredients=test',
      () => {
        it('it should return an error message', (done) => {
          chai.request(server).
              get('/ingredients').
              query({ingredients: 'test'}).
              end((err, res) => {
                res.should.have.status(400);
                (res.text.length > 40).should.be.true;
                done();
              });
        });
      });
  describe(
      '/GET /ingredients?allergens=test',
      () => {
        it('it should return an error message', (done) => {
          chai.request(server).
              get('/ingredients').
              query({allergens: 'test'}).
              end((err, res) => {
                res.should.have.status(400);
                (res.text.length > 40).should.be.true;
                done();
              });
        });
      });
  describe(
      '/GET /ingredients?allergens=test?ingredients=test',
      () => {
        it('it should return an error message', (done) => {
          chai.request(server).
              get('/ingredients').
              query({allergens: 'test', allergens: 'test'}).
              end((err, res) => {
                res.should.have.status(400);
                (res.text.length > 40).should.be.true;
                done();
              });
        });
      });
});

after(() => {
  server.close(() => {
    this.connectionFactory.closeConnection();
  });
});
