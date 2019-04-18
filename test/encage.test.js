var chai = require('chai');
var encage = require('../src/index.js');
var assert = chai.assert;

describe('Encage', function() {
    it('returns an object', function () {
        encaged = encage();
        assert.isObject(encaged, 'encage object is an object');
    });
    it('checks for error if user overides create method', function() {
        const config = {
            static: { create: function () { } }
        };
        assert.throws(encage.bind(null,config),"Try using a different method name besides create in your static config. Can't overrid encage's create method");
    });
});