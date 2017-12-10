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
     * @returns {Promise<any | *>}
     */
    async getObject() {
        return this.object;
    }

    /**
     *
     * @returns {Promise<string|*>}
     */
    async getIngredientName() {
        return this.ingredient;
    }


}
exports.IngredientModel = IngredientModel;