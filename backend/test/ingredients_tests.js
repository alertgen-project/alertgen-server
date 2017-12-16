process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server.js');

chai.use(chaiHttp);

describe('ingredients', () => {
  describe(
      '/GET /ingredients?ingredients=DelicousPancakeDough&allergens=gluten',
      () => {
        it('it should GET all the ingredient', (done) => {
          chai.request(server).
              get('/ingredients?ingredients=DelicousPancakeDough&allergens=gluten').
              end((err, res) => {
                res.should.be.a.json;
                res.should.have.status(200);
                done();
              });
        });
      });
});

after(() => {
  server.close(() => {
    process.exit(0);
  });
});
