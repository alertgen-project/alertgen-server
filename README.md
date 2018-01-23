# Project AlertGen - alertgen-server

This project provides users with an API to identify allergens in products and ingredients. In addition, substitute products for products containing allergens can be requested.

## API

### /product

By sending a request to the route "/product", barcodes or products can be checked for specific allergens.

##### Technical Specification:

GET-Request with barcode or product name and list of allergens as query parameters.

```http
GET /product?product=nutella&allergens=gluten&allergens=soy HTTP/1.1
Host: allergy-check.informatik.hs-augsburg.de
Content-Type: application/json; charset=utf-8
```

###### Response:

JSON with product object containing boolean of all and detail object with specific booleans for allergens.

```json
{"barcode":"0009800895250","all":false,"detail":{"gluten":false,"soy":false}}
```

###### Possible Errors:

- _ProductWrongParameter_, Code: 400, 'Usage of this service is for example: /product?product=12324234&allergens=gluten&allergens=lactose'
- _ProductNotFound_, Code: 404, 'The requested product cannot be found in the database'
- _InvalidAllergen_, Code: 400, 'The allergens in the request are invalid'

### /productCategory

The route "/productcategory" can be used to request substitute products for products containing allergens.

##### Technical Specification:

GET-Request with product category and list of allergens as query parameters.

```http
GET /productcategory?productCategory=butters&allergens=milk HTTP/1.1
Host: allergy-check.informatik.hs-augsburg.de
Content-Type: application/json; charset=utf-8
```

###### Response:

JSON with array of product names which do not contain the requested allergens.

```json
[{"name":"erdnusscreme - kg fancy food handels gmbh & co. - 350 g","barcode":"23154131"},
{"name":"Deutsche Markenbutter mild gesäuert — ja! — 250 g","barcode":"4388840102433"}]
```

###### Possible Errors:

- _CategoryWrongParameter_, Code: 400, 'Usage of this service is for example: /productcategory?productCategory=pizza&allergens=gluten&allergens=lactose'
- _CategoryNotFound_, Code: 404, 'The category you requested with the name "category" contains no products.'

### /ingredients

Via the route "/ingredients" ingredients can be checked for specific allergens. These possible allergens are displayed with probabilities next to the ingredients.

##### Technical Specification:

GET-Request with list of ingredients and list of allergens as query parameters.

```http
GET /ingredients?ingredients=soy%20sauce&ingredients=butter&ingredients=tempeh&ingredients=seitan&ingredients=wheat&allergens=gluten&allergens=sesame&allergens=milk HTTP/1.1
Host: allergy-check.informatik.hs-augsburg.de
Content-Type: application/json; charset=utf-8
```

###### Response:

JSON with array of ingredient objects which contain objects of the allergens with a boolean field "containing" and a percentage with the probability that the product contains the allergen.

```json
[{"soy sauce":{"gluten":{"containing":false,"contains_percent":0},"sesame":{"containing":false,"contains_percent":0.2},"milk":{"containing":false,"contains_percent":0}}},{"butter":{"gluten":{"containing":false,"contains_percent":0},"sesame":{"containing":false,"contains_percent":0},"milk":{"containing":true,"contains_percent":0}}},{"tempeh":{"gluten":{"containing":false,"contains_percent":0},"sesame":{"containing":false,"contains_percent":0.2},"milk":{"containing":false,"contains_percent":0}}},{"seitan":{"gluten":{"containing":true,"contains_percent":1},"sesame":{"containing":false,"contains_percent":0.3},"milk":{"containing":false,"contains_percent":0}}},{"wheat":{"gluten":{"containing":true,"contains_percent":1},"sesame":{"containing":false,"contains_percent":0},"milk":{"containing":false,"contains_percent":0}}}]
```

###### Possible Errors:

- _IngredientsWrongParameter_, Code: 400, 'Usage of this service is for example: /ingredients?ingredients=water&ingredients=milk&allergens=gluten&allergens=lactose'
- _AllergenNotFoundError_, Code: 404, 'The allergen you requested with the name "%allergen" is not listed in our database.'
- _IngredientNotIndexedError_, Code: 404, 'We don't have any data about your requested Ingredient: %ingredient.'

### /helpus

Via the route "/helpus" ingredients can be updated by the community for specific allergens. The ingredient and the allergen are posted to the route with a boolean of containing the allergen.

##### Technical Specification:

POST-Request with ingredient, allergen and contains(boolean) as query parameters. 

```http
POST /helpus?ingredient=wheat&allergen=gluten&contains=true HTTP/1.1
Host: allergy-check.informatik.hs-augsburg.de
Content-Type: application/json; charset=utf-8
```

###### Response:

```json
{"message": "wheat updated"}
```

###### Possible Errors:

- _HelpUsWrongParameter_, Code: 400, 'Usage of this service is for example: /helpus?ingredient=wheat&allergen=gluten&contains=true'
- _ContainsWrongParameter_, Code: 400, 'Only the values "true" and "false" are accepted for the parameter "contains"'


## Data Sources

### Own Database with ingredients, products and allergen data

## Tech Stack

- Node.js (Backend)
    - Koa (API, Routing)
    - node-config (Configuration)
    - bunyan (Logging)
    - mocha + chai (Testing)
    - erroz (Errors)
    - Mongoose (models and validation)
- MongoDB (Database)
- Docker

## License

Unlicense


:speak_no_evil:
