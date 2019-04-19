var chai = require('chai');
var encage = require('../src/index.js');
var assert = chai.assert;

describe('#encage', function() {
    it('throws error if encage takes any but Function or Object', function() {
        assert.throws(encage.bind(null, "config"), 'Must use a constructor Function or Object');
        assert.throws(encage.bind(null, 3), 'Must use a constructor Function or Object');
        assert.throws(encage.bind(null, true), 'Must use a constructor Function or Object');
        assert.throws(encage.bind(null, []), 'Must use a constructor Function or Object');
    })
});