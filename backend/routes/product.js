module.exports = {
    isAllergicToProduct: isAllergicToProduct
};


async function isAllergicToProduct(ctx, next) {
    ctx.body = false;
}
