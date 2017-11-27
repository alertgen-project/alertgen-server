# Project AlertGen

This project provides users with an API to identify allergens in products and ingredients. In addition, substitute products for products containing allergens can be requested.

## API

### /product

By sending a request to the route "/product", barcodes or products can be checked for specific allergens. 


### /productCategory

The route "/productCategory" can be used to request substitute products for products containing allergens.

### /ingredients 

Via the route "/ingredients" ingredients can be checked for specific allergens. These possible allergens are displayed with probabilities next to the ingredients.

## Data Sources

### Own trained Database

### Open Food Facts Database

## Tech Stack

- Node.js (Backend)
- ElasticSearch (Database)
- Docker


