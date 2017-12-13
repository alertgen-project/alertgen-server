"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
        name: {
            type: String,
            lowercase: true
        },
        gluten: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        crustaceans: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        eggs: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        fish: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        peanuts: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        soy: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        milk: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        nuts: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        celery: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        mustard: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        sesame: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        sulphites: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        lupin: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        },
        molluscs: {
            contains: Boolean,
            contains_percent: Number,
            contains_pos: Number,
            contains_neg: Number
        }
    }, {runSettersOnQuery: true});

const Ingredient = new mongoose.model('Ingredient', ingredientSchema);


module.exports = {
    Ingredient,
};