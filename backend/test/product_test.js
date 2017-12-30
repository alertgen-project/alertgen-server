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

describe('product route tests', () => {

  const testProductBarcode = '123123113';
  const testProductName = 'salami';
  const invalidAllergen = 'lactose';
  const wrongBarcode = '123123123123';

  it('should request product by name and say if contains requested allergens', async () => {
    const res = await chai.request(server).
        get('/product').
        query({
          product: testProductName,
          allergens: ['gluten', 'soy'],
        });
    res.should.be.a.json;
    res.body.detail.gluten.should.be.true;
    console.log(res.body.detail);
    res.should.have.status(200);
  });

  it('should request product by barcode and say if contains requested allergens', async () => {
    const res = await chai.request(server).
        get('/product').
        query({
          product: testProductBarcode,
          allergens: ['gluten', 'soy'],
        });
    res.should.be.a.json;
    res.body.detail.gluten.should.be.true;
    console.log(res.body);
    res.should.have.status(200);
  });

  it('should throw ProductWrongParameterError because one parameter has been set wrong', async () => {
    await chai.request(server).
        get('/product').
        query({
          productCategory: testProductBarcode,
          allergens: ['gluten', 'soy'],
        }).catch((e) => {
          e.should.have.status(400);
        });
  });

  it('should throw ProductNotFoundError because the requested product cannot be found in database', async () => {
    await chai.request(server).
        get('/product').
        query({
          product: wrongBarcode,
          allergens: ['gluten'],
        }).catch((e) => {
          e.should.have.status(404);
        });
  });

  it('should throw InvalidAllergen because one of the requested allergens has been set wrong', async () => {
    await chai.request(server).
        get('/product').
        query({
          product: testProductBarcode,
          allergens: [invalidAllergen],
        }).catch((e) => {
          e.should.have.status(400);
        });
  });

});

after(() => {
  server.close(() => {
    connectionFactory.closeConnection();
  });
});