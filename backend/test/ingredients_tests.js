process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server.js');

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
    mongoose.connection.close()
  });
});
