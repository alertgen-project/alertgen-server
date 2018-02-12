const request = require('request');
const StreamObject = require('stream-json/utils/StreamObject');

(async () => {
  const stream = StreamObject.make();
  stream.output.on('readable', async () => {
    const objectReference = stream.output.read();
    if (objectReference !== null && objectReference.key === 'products') {
      const products = objectReference.value;
      products.forEach(product => {
        // print the products barcode
        console.log(product.code);
      });
    }
  });
  request.get('https://fr-en.openfoodfacts.org/category/pizzas/1.json').
      on('error', (err) => {
        console.log(err);
      }).
      on('response', (response) => {
        console.log(response.statusCode); // 200
        console.log(response.headers['content-type']);
      }).
      pipe(stream.input);
})();
