'use strict';

const erroz = require('erroz');

const ProductWrongParameterError = erroz({
  name: 'ProductWrongParameter',
  code: 'ProductWrongParameter',
  statusCode: 400,
  template: 'Usage of this service is for example: /product?product=12324234&allergens=gluten&allergens=lactose',
});

module.exports = {
  ProductWrongParameterError,
};
