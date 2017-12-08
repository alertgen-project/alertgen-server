module.exports = {
  postFeedback: postFeedback,
};

const HelpUsErrors = require('../errors/help_us_errors.js');
const log = require('../logger/logger.js').getLog('help_us.js');

async function postFeedback(ctx, next) {
  if (!ctx.query.ingredient || !ctx.query.allergen) {
    ctx.throw(new HelpUsErrors.HelpUsWrongParameterError());
  }
  const ingredient = ctx.query.ingredient;
  const allergen = ctx.query.allergen;
  log.debug('Using Queryparameters:', ingredient, allergen);
  // manipulate db
  // form response
  return ctx.body = true;
}
