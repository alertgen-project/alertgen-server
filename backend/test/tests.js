"use strict";

require('chai').should();

const foo = 'Hello';
const bar = 1;

describe('String assertion', () =>{
  it('Should be a string', ()=> {
    foo.should.be.a('string');
  });
  it('Should be also a string', ()=> {
    bar.should.be.a('string');
  });
});
