'use strict';

const erroz = require('erroz');

const DBConnectionFailedError = erroz({
  name: 'DBConnectionFailedError ',
  code: 'DBConnectionFailedError ',
  statusCode: 503,
  template: 'Database not available!',
});

const UnexpectedError = erroz({
  name: 'UnexpectedError',
  code: 'UnexpectedError',
  statusCode: 503,
  template: 'Something unexpected happened!',
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
