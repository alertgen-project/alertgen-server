module.exports = {
    containAllergens: containAllergens
};


async function containAllergens(ctx, next) {
    // read params, TODO: create lists
    const ingredients = ctx.query.ingredients;
    const allergens = ctx.query.allergens;
    console.log(ingredients, allergens);
    // requestss to db

    // form response
    ctx.body = false;
}
