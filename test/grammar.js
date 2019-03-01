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
    describe('Sequence', function() {
        describe('#match()', function() {
            it('"ab" should fail if "a" and not "b"', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let seq = a.then(b);
                let res = seq.match('ac');
                assert.equal(res.matched, false);
                assert.equal(res.remaining, 'ac');
            });
            it('"ab" should fail if "a" doesn\'t match', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let seq = a.then(b);
                let res = seq.match('cb');
                assert.equal(res.matched, false);
                assert.equal(res.remaining, 'cb');

            });
            it('"ab" should pass if "a" then "b"', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let seq = a.then(b);
                let res = seq.match('ab');
                assert.equal(res.matched, true);
                assert.equal(res.remaining, '');
            });
        });
    });
    describe('Optional', function() {
        it('a? should pass if "a"', function() {
            let a = new Terminal('a');
            let optional = a.optionally();
            let res = optional.match('a');
            assert.equal(res.matched, true);
            assert.equal(res.remaining, '');
        });
        it('a? should pass if not "a"', function() {
            let a = new Terminal('a');
            let optional = a.optionally();
            let res = optional.match('b');
            assert.equal(res.matched, true);
            assert.equal(res.remaining, 'b');
        });
    });
}
