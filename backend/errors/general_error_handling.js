module.exports = {
  handleGeneralError: handleGeneralError,
};

async function handleGeneralError(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
}
