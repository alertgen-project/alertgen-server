module.exports = {
  containAllergens: containAllergens,
};

const IngredientsErrors = require('../errors/ingredients_errors.js')

async function containAllergens(ctx, next) {
  if (!ctx.query.ingredients || !ctx.query.allergens) {
    ctx.throw(new IngredientsErrors.IngredientsWrongParameterError());
  }
  // read params, TODO: create lists
  const ingredients = ctx.query.ingredients;
  const allergens = ctx.query.allergens;
  console.log(ingredients, allergens);
  // request data from db
  // form response
  return ctx.body = true;
}
