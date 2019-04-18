var chai = require('chai');
var encage = require('../index.js');
var assert = chai.assert;

describe('Encage', function() {
    describe('#createClass', function() {
        it('returns an object', function () {
            encaged = encage.createClass();
            assert.isObject(encaged, 'encage object is an object');
        })
    });
});