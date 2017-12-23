'use strict';

const erroz = require('erroz');

const HelpUsWrongParameterError = erroz({
  name: 'HelpUsWrongParameter',
  code: 'HelpUsWrongParameter',
  statusCode: 400,
  template: 'Usage of this service is for example: /helpus?ingredient=wheat&allergen=gluten&contains=true',
});

const ContainsWrongParameterError = erroz({
  name: 'ContainsWrongParameter',
  code: 'ContainsWrongParameter',
  statusCode: 400,
  template: 'Only the values "true" and "false" are accepted for the parameter "contains"',
});

module.exports = {
  HelpUsWrongParameterError,
  ContainsWrongParameterError,
};
