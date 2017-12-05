const erroz = require("erroz");

const IngredientsWrongParameterError = erroz({
  name: "IngredientsWrongParameter",
  code: "IngredientsWrongParameter",
  statusCode: 400,
  template: "Usage of this service is: /ingredients?ingredients=[water,sugar,milk,wheat]&allergens=[gluten,lactose]"
});


module.exports = {
  IngredientsWrongParameterError: IngredientsWrongParameterError,
};
