"use strict";

class IngredientModel {

    /**
     *
     * @param jsonString
     */
    constructor(jsonString) {
        this.object = JSON.parse(jsonString);
        for (let ingredient in this.object) {
            this.ingredient = ingredient;
        }

    }

    /**
     *
     * @returns {any | *}
     */
    getObject() {
        return this.object;
    }

    /**
     *
     * @returns {string|*}
     */
    getIngredientName() {
        return this.ingredient;
    }


}
exports.IngredientModel = IngredientModel;