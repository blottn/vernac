var assert = require('assert');
var grammar = require('../grammar.js');

with (grammar) {
    describe('Empty', function () {
        describe('#match()', function() {
            it('should match nothing', function() {
                assert.equal(new Empty().match('').remaining, '');
            });
            it('should match anything', function() {
                let input = 'some large test string';
                assert.equal(new Empty().match(input).remaining, input);
            });
        });
    });
    describe('Terminal', function() {
        describe('#match()', function() {
            it('should match when empty', function() {
                let input = 'asdf';
                let res = new Terminal('').match(input);
                assert.equal(res.matched, true);
                assert.equal(res.remaining, input);
            });
            it('should match strings', function() {
                let input = 'abcdef';
                let term = 'ab';
                let res = new Terminal('ab').match('abcdef');
                assert.equal(res.matched, true);
                assert.equal(res.remaining, input.substring(term.length));
            });
        });
    });
    describe('OrderedChoice', function() {
        describe('#match()', function() {
            it('should match first', function() {
                let input = 'ab';
                let peg = new OrderedChoice(new Terminal('a'), new Terminal('b'));
                let res = peg.match(input);
                assert.equal(res.matched, true);
                assert.equal(res.remaining, 'b');
            });
            it('should match second if first fails', function() {
                let input = 'ab';
                let peg = new OrderedChoice(new Terminal('b'), new Terminal('a'));
                let res = peg.match(input);
                assert.equal(res.matched, true);
                assert.equal(res.remaining,'b');
            });
            it('should fail', function() {
                let input = 'ab';
                let peg = new OrderedChoice(new Terminal('c'), new Terminal('d'));
                assert.equal(peg.match(input).matched, false);
            });
        });
    });
}
