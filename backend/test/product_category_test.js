'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
chai.should();
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');
const server = require('../server.js');
const {connectionFactory} = require('../models/connection_factory');
chai.use(chaiHttp);
chai.use(chaiAsPromised);

const testCategory = 'juices';
const unindexedTestCategory = 'brot';
const testAllergens = ['milk', 'gluten'];
const testName = 'orange juice with pulp - good & delish';

describe('/productcategory route tests', () => {
  it('should request products of product category which doesn\'t contain requested allergens', async () => {
    const res = await chai.request(server).
        get('/productcategory').
        query({
          productCategory: testCategory,
          allergens: testAllergens,
        });
    res.should.be.a.json;
    (res.body)[0].name.should.equal(testName);
    console.log(res.body);
    res.should.have.status(200);
  });
  it('should throw ProductCategoryWrongParameterError because one parameter has been set wrong', async () => {
    await chai.request(server).
        get('/productcategory').
        query({
          product: testCategory,
          allergens: testAllergens,
        }).catch((e) => {
          console.log(e);
          e.should.have.status(400);
        });
  });
  it('should throw ProductCategoryWrongParameterError because only one parameter has been set', async () => {
    await chai.request(server).
        get('/productcategory').
        query({
          product: testCategory,
        }).catch((e) => {
          console.log(e);
          e.should.have.status(400);
        });
  });
  it('should throw ProductCategoryNotFoundError because category "brot" contains no products', async () => {
    await chai.request(server).
        get('/productcategory').
        query({
          productCategory: unindexedTestCategory,
          allergens: testAllergens,
        }).catch((e) => {
          console.log(e);
          e.should.have.status(404);
        });
  });
});

after(() => {
  server.close(() => {
    connectionFactory.closeConnection();
  });
});