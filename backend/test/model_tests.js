"use strict";

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
        const name = waterModel.getIngredientName();
        name.should.equal('water');
    });

    it('Should access ingredient name', async () => {
        const water = {
            "water": {
                "gluten": {
                    "contains": true
                }
            }
        };
        const waterModel = new IngredientModel(JSON.stringify(water));
        const name = waterModel.ingredient;
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
        const obj = waterModel.getObject();
        obj.should.deep.equal(water);
    });
    it('Should access ingredient object', async () => {
        const water = {
            "water": {
                "gluten": {
                    "contains": true
                }
            }
        };
        const waterModel = new IngredientModel(JSON.stringify(water));
        const obj = waterModel.object;
        obj.should.deep.equal(water);
    });
});