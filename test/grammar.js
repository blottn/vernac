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
    describe('Terminal', function() {
        describe('#match()', function() {
            it('should match when empty', function() {
                assert.equal(new Terminal('').match('asdf'),'asdf');
            });
            it('should match strings', function() {
                assert.equal(new Terminal('ab').match('abcdef'),'cdef');
            });
        });
    });
    describe('OrderedChoice', function() {
        describe('#match()', function() {
            it('should match first', function() {
                let input = 'ab';
                let peg = new OrderedChoice(new Terminal('a'),new Terminal('b'));
                assert.equal(peg.match(input),'b');
            });
            it('should match second if first fails', function() {
                let input = 'ab';
                let peg = new OrderedChoice(new Terminal('b'),new Terminal('a'));
                assert.equal(peg.match(input),'b');
            });
            it('should fail', function() {
                let input = 'ab';
                let peg = new OrderedChoice(new Terminal('c'),new Terminal('d'));
                assert.equal(peg.match(input),'');
            });
            it('should return first matching', function() {

            });
        });
    });
}
