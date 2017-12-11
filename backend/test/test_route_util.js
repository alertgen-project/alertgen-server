const RouteUtil = require('../routes/route_util.js');
require('chai').should();
const assert = require('assert');

describe('Array', function() {
  describe('#RouteUtil.toArray()', () => {
    it('should always return an Array', () => {
      assert.equal(typeof RouteUtil.toArray([]), typeof []);
      assert(RouteUtil.toArray([1, 2, 3]) instanceof Array);
      assert(RouteUtil.toArray(1) instanceof Array);
      assert(RouteUtil.toArray('') instanceof Array);
      assert(RouteUtil.toArray([]) instanceof Array);

    });

    it('should never nest Arrays', () => {
      let testSubject = RouteUtil.toArray([0]);
      assert.equal(testSubject[0], 0);
      testSubject = RouteUtil.toArray(0);
      assert.equal(testSubject[0], 0);
      testSubject = RouteUtil.toArray(['test']);
      assert.equal(testSubject[0], 'test');
      testSubject = RouteUtil.toArray('test');
      assert.equal(testSubject[0], 'test');
    });
  });
});
