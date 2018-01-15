# AlertGen Indexer

Indexes documents, which are declared in lists of json files in the

./indexer/data directory, into the mongodb which is used by the alertgen REST-API.

## Structure of the used JSON-files

A json-file used for indexing documents has the following structure:

```json
[
    {
      "document1": "data1"
    },
    {
       "document2": "data2"
    }
]
```

The file products.json would therefore contain:

```json
[
    {
      "name": "Spaghetti - Asda - 500 g",
      "categories": ["pastas"],
      "barcode": "5051413183144",
      "ingredients": ["white cornflour", "yellow cornflour", "rice flour", "diglyceride", "monoglyceride"]
    },
    {
      "name": "Nutella",
      "categories": ["spreads"],
      "barcode": "0009800895250",
      "ingredients": ["sugar", "palm oil", "hazelnut", "cocoa", "skim milk", "reduced minerals whey", "lecithin", "vanillin"]
    }
 ]
```

## Configuration

The configuration file default.json is located in the ./indexer/config directory.

```json
{
  "db": {
    "host": "address-to-your-mongo-db",
    "port": 8080, // port of the mongodb
    "name": "targetDatabaseInTheMongoDB",
    "user": "userForAuthentication",
    "pw": "passwordForAuthentication"
  },
  "toIndex": [
    "products", "ingredients" // the json files in the data-directory to index
  ],
  "logger": {
    "path": "./logs/server_log.json", // location of logfile
    "level": "trace", // log-options, we use bunyan for logging
    "period": "1w",
    "count": "2"
  },
  // holds only several documents of the parsed json-file in memory, parses a whole file before indexing if false.
  "asyncFileRead": true,
  // amount of maximal parallel requests in async-read-mode, pauses reading until the requests are finished
  "maxParallelRequests": 30
}
```

## Where is the data going to be indexed?

We currently support two type of models (ingredients and products)
which use different collections with the name of the model as their collectionname.
The structure of those models is declared in the ingredient_model.js and
the product_model.js of the ./backend/models (REST-API) folder. The used mongodb
and its target database can be defined in the configuration.

## What happens if a document is already indexed in the database?
The indexer informs the user about documents
which couldn't be indexed because their unique fields are already indexed via it's log and continues indexing the
remaining documents in that case. It currently can't reindex documents and won't remove
any documents from the database.

## How to start indexing?

```
cd ./allergy-check/indexer
node main.js
```