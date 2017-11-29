const Koa = require('koa');
const Router = require('koa-router');
const config = require('config');

const router = new Router();
const server = new Koa();

router.get('/', async (ctx, next) => {
    ctx.body = "Hello World!";
});

router.get('/service', async (ctx, next) => {
    ctx.body = "Hello World!";
    console.log(ctx.query.parametername);
});

server
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(config.get('alertgen.serverConfig.port'));

