const Koa = require('koa');
const Router = require('koa-router');
const config = require('config');

const product = require('./routes/product.js');
const ingredients = require('./routes/ingredients.js');
const generalError = require('./errors/general_error_handling.js');

const router = new Router();
const server = new Koa();

const log = require('./logger/logger.js').getLog('server.js');

router.get(config.get('routes.product'), product.isAllergicToProduct).
    get(config.get('routes.ingredients'), ingredients.containAllergens);

server.use(router.routes()).
    use(router.allowedMethods()).
    use(generalError.handleGeneralError).
    listen(config.get('server.port'));

log.info('Server listening at port: ' + config.get('server.port'));
