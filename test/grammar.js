var assert = require('assert');
var grammar = require('../grammar.js');

with (grammar) {
    describe('Empty', function () {
        describe('#match()', function() {
            it('should match nothing', function() {
                assert.equal(new Empty().match(''),'');
            });
            it('should match anything', function() {
                let input = 'some large test string';
                assert.equal(new Empty().match(input),input);
            });
        });
    });
}
