require('chai').should();
const { IngredientModel } = require('../models/ingredient_model');

describe('Ingredient Model Tests', () => {
    it('Should return ingredient name', async () => {
        const water = {
            "water": {
                "gluten": {
                    "contains": true
                }
            }
        };
        const waterModel = new IngredientModel(JSON.stringify(water));
        const name = await waterModel.getIngredientName();
        name.should.equal('water');
    });

    it('Should return ingredient object', async () => {
        const water = {
            "water": {
                "gluten": {
                    "contains": true
                }
            }
        };
        const waterModel = new IngredientModel(JSON.stringify(water));
        const obj = await waterModel.getObject();
        obj.should.deep.equal(water);
    });
});