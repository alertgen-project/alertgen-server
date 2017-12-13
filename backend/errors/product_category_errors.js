'use strict';

const erroz = require('erroz');

const ProductCategoryWrongParameterError = erroz({
  name: 'ProductCategoryWrongParameter',
  code: 'ProductCategoryWrongParameter',
  statusCode: 400,
  template: 'Usage of this service is for example: /productcategory?productCategory=pizza&allergens=gluten&allergens=lactose',
});

module.exports = {
  ProductCategoryWrongParameterError,
};
