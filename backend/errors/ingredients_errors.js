'use strict';

const erroz = require('erroz');

const IngredientsWrongParameterError = erroz({
  name: 'IngredientsWrongParameter',
  code: 'IngredientsWrongParameter',
  statusCode: 400,
  template: 'Usage of this service is for example: /ingredients?ingredients=water&ingredients=milk&allergens=gluten&allergens=lactose',
});

const AllergenNotFoundError = erroz({
  name: 'AllergenNotFoundError',
  code: 'AllergenNotFoundError',
  statusCode: 400,
  template: 'The allergen you requested is not listed in our database.',
});

const IngredientNotIndexedError = erroz({
  name: 'IngredientNotIndexedError',
  code: 'IngredientNotIndexedError',
  statusCode: 400,
  template: 'We don\'t have any data about your requested Ingredient: %ingredient.',
});

module.exports = {
  IngredientsWrongParameterError,
  AllergenNotFoundError,
  IngredientNotIndexedError
};
