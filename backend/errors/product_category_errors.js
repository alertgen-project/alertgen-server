'use strict';

const erroz = require('erroz');

const ProductCategoryWrongParameterError = erroz({
  name: 'ProductCategoryWrongParameter',
  code: 'ProductCategoryWrongParameter',
  statusCode: 400,
  template: 'Usage of this service is for example: /productcategory?productCategory=pizza&allergens=gluten&allergens=lactose',
});

const ProductCategoryNotFoundError = erroz({
  name: 'CategoryNotFound',
  code: 'CategoryNotFound',
  statusCode: 400,
  template: 'The category you requested with the name "%category" contains no products.',
});

module.exports = {
  ProductCategoryWrongParameterError,
  ProductCategoryNotFoundError
};
