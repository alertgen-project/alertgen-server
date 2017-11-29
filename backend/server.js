const Koa = require('koa');
const config = require('config');
const server = new Koa();

server.use(async ctx => {
    ctx.body = 'Hello World';
});

server.listen(config.get('alertgen.serverConfig.port'));
console.log('Server listening on port ' + config.get('alertgen.serverConfig.port') + '!');