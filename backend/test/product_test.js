'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');
const server = require('../server.js');
const {connectionFactory} = require('../models/connection_factory');
chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('product route tests', () => {

  const testProductBarcode = '123123113';
  const testProductName = 'salami';

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
});

after(() => {
  server.close(() => {
    connectionFactory.closeConnection();
  });
});