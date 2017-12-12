"use strict";

const erroz = require("erroz");

const HelpUsWrongParameterError = erroz({
  name: "HelpUsWrongParameter",
  code: "HelpUsWrongParameter",
  statusCode: 400,
  template: "Usage of this service is for example: /helpus?ingredient=wheat&allergen=gluten"
});


module.exports = {
  HelpUsWrongParameterError,
};
