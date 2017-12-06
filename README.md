# Project AlertGen

This project provides users with an API to identify allergens in products and ingredients. In addition, substitute products for products containing allergens can be requested.

## API

### /product

By sending a request to the route "/product", barcodes or products can be checked for specific allergens. 

##### Technical Specification:

GET-Request with barcode or product name and list of allergens as query parameters.

```
GET /product?product=12324234&allergens=[gluten,lactose] 
```

###### Response: 

JSON with product object containing boolean of all and detail object with specific booleans for allergens.

{"12324234": {all: boolean, detail: {gluten: true, lactose: false}}}
 

### /productCategory

The route "/productcategory" can be used to request substitute products for products containing allergens.

##### Technical Specification:

GET-Request with product category and list of allergens as query parameters.

```
GET /productcategory?productCategory=pizza&allergens=[gluten,lactose] 
```

###### Response:

JSON with array of product names which do not contain the requested allergens.

{"products": [{productName: "bla", barcode: 12344},{productName: "bla", barcode: 12344},{productName: "bla", barcode: 12344}]}

### /ingredients 

Via the route "/ingredients" ingredients can be checked for specific allergens. These possible allergens are displayed with probabilities next to the ingredients.

##### Technical Specification:

GET-Request with list of ingredients and list of allergens as query parameters.

```
GET /ingredients?ingredients=[water,sugar,milk,wheat]&allergens=[gluten,lactose]
```

###### Response:

JSON with array of ingredient objects which contain objects of the allergens with a boolean field "containing" and a percentage with the probability that the product contains the allergen.

### /helpus

POST-Request with ingredient and allergen as query parameters.

```
POST /helpus?ingredient=wheat&allergen=gluten
```


## Data Sources

### Own trained Database

### Open Food Facts Database

We downloaded a dumb of the OFF Database on 11/27/2017. Most of the data will be requested there.

## Tech Stack

- Node.js (Backend)
    - Koa (API, Routing)
    - node-config (Configuration)
- MongoDB (Database)
- Docker

 :speak_no_evil:
