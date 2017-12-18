'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const config = require('config');

const product = require('./routes/product.js');
const productCategory = require('./routes/product_category.js');
const ingredients = require('./routes/ingredients.js');
const helpUs = require('./routes/help_us.js');

const generalError = require('./errors/general_error_handling.js');
const log = require('./logger/logger.js').getLog('server.js');

const json = require('koa-json');
const router = new Router();
const app = new Koa();

router.get(config.get('routes.product'), product.isAllergicToProduct).
    get(config.get('routes.productcategory'), productCategory.
        retrieveProductsWithoutAllergens).
    get(config.get('routes.ingredients'), ingredients.containAllergens).
    post(config.get('routes.helpus'), helpUs.postFeedback);

const server = app.use(router.routes()).
    use(router.allowedMethods()).
    use(generalError.handleGeneralError).
    use(json).
    listen(config.get('server.port'));

log.info('Server listening at port: ' + config.get('server.port'));
module.exports = server; // for testing
