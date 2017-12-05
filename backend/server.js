const Koa = require('koa');
const Router = require('koa-router');
const config = require('config');

const product = require('./routes/product.js');
const ingredients = require('./routes/ingredients.js');

const router = new Router();
const server = new Koa();

router.get(config.get('routes.product'), product.isAllergicToProduct);
router.get(config.get('routes.ingredients'), ingredients.containAllergens);

server
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(config.get('server.port'));

console.log('Server listening at port: ' + config.get('server.port'));
