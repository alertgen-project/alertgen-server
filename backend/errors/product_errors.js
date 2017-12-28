'use strict';

const erroz = require('erroz');

const ProductWrongParameterError = erroz({
  name: 'ProductWrongParameter',
  code: 'ProductWrongParameter',
  statusCode: 400,
  template: 'Usage of this service is for example: /product?product=12324234&allergens=gluten&allergens=lactose',
});

const ProductNotFoundError = erroz({
  name: 'ProductNotFound',
  code: 'ProductNotFound',
  statusCode: 400,
  template: 'The requested product cannot be found in the database',
});

module.exports = {
  ProductWrongParameterError, ProductNotFoundError
};
