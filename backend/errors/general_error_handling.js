'use strict';

const erroz = require('erroz');

const DBConnectionFailedError = erroz({
  name: 'DBConnectionFailedError ',
  code: 'DBConnectionFailedError ',
  statusCode: 503,
  template: 'Database not available!',
});

async function handleGeneralError(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
}

module.exports = {
  handleGeneralError,
  DBConnectionFailedError,
};
