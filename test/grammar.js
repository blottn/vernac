var assert = require('assert');
var grammar = require('../grammar.js');

with (grammar) {
    describe('Empty', function () {
        describe('#parse()', function() {
            it('should match nothing', function() {
                assert.equal(new Empty().parse('').remaining, '');
            });
            it('should match anything', function() {
                let input = 'some large test string';
                assert.equal(new Empty().parse(input).remaining, input);
            });
            it('should always be nullable', function() {
                assert.equal(new Empty().nullable, true);
            });
        });
    });
    describe('Terminal', function() {
        describe('#parse()', function() {
            it('should match when empty', function() {
                let input = 'asdf';
                let res = new Terminal('').parse(input);
                assert.equal(res.matched, true);
                assert.equal(res.remaining, input);
            });
            it('should match strings', function() {
                let input = 'abcdef';
                let term = 'ab';
                let res = new Terminal('ab').parse('abcdef');
                assert.equal(res.matched, true);
                assert.equal(res.remaining, input.substring(term.length));
            });
            it('should be nullable iff it is empty', function() {
                assert.equal(new Terminal('').nullable, true);
                assert.equal(new Terminal('a').nullable, false);
            });
        });
    });
    describe('OrderedChoice', function() {
        describe('#parse()', function() {
            it('should match first', function() {
                let input = 'ab';
                let peg = new Terminal('a').or(new Terminal('b'));
                let res = peg.parse(input);
                assert.equal(res.matched, true);
                assert.equal(res.remaining, 'b');
            });
            it('should match second if first fails', function() {
                let input = 'ab';
                let peg = new Terminal('b').or(new Terminal('a'));
                let res = peg.parse(input);
                assert.equal(res.matched, true);
                assert.equal(res.remaining,'b');
            });
            it('should fail', function() {
                let input = 'ab';
                let peg = new Terminal('c').or(new Terminal('d'));
                assert.equal(peg.parse(input).matched, false);
            });
            it('should be nullable if either are nullable', function() {
                let nullable = new Empty();
                let a = new Terminal('a');
                assert.equal(nullable.or(a).nullable, true);
                assert.equal(a.or(nullable).nullable, true);
                assert.equal(nullable.or(nullable).nullable, true);
                assert.equal(a.or(a).nullable, false);
            });
        });
    });
    describe('Sequence', function() {
        describe('#parse()', function() {
            it('"ab" should fail if "a" and not "b"', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let seq = a.then(b);
                let res = seq.parse('ac');
                assert.equal(res.matched, false);
                assert.equal(res.remaining, 'ac');
            });
            it('"ab" should fail if "a" doesn\'t match', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let seq = a.then(b);
                let res = seq.parse('cb');
                assert.equal(res.matched, false);
                assert.equal(res.remaining, 'cb');

            });
            it('"ab" should pass if "a" then "b"', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let seq = a.then(b);
                let res = seq.parse('ab');
                assert.equal(res.matched, true);
                assert.equal(res.remaining, '');
            });
            it('should be nullable if both are nullable', function() {
                let a = new Terminal('a');
                let nullable = new Empty();
                assert.equal(a.then(a).nullable, false);
                assert.equal(a.then(nullable).nullable, false);
                assert.equal(nullable.then(a).nullable, false);
                assert.equal(nullable.then(nullable).nullable, true);
            });
        });
    });
    describe('Optional', function() {
        describe('#parse()', function() {
            it('a? should pass if "a"', function() {
                let a = new Terminal('a');
                let optional = a.optionally();
                let res = optional.parse('a');
                assert.equal(res.matched, true);
                assert.equal(res.remaining, '');
            });
            it('a? should pass if not "a"', function() {
                let a = new Terminal('a');
                let optional = a.optionally();
                let res = optional.parse('b');
                assert.equal(res.matched, true);
                assert.equal(res.remaining, 'b');
            });
            it('should always be nullable', function() {
                let a = new Terminal('a');
                let nullable = new Empty();
                assert.equal(a.optionally().nullable, true);
                assert.equal(nullable.optionally().nullable, true);
            });
        });
    });
    describe('Lookahead', function() {
        describe('#parse()', function() {
            it('"a&b" should match "a" and return just the "a" match', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let lookahead = a.before(b);
                let res = lookahead.parse('ab');
                assert.equal(res.matched, true);
                assert.equal(res.remaining, 'b');
            });
            it('"a&b" should fail if just "a" and not "b"', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let lookahead = a.before(b);
                let res = lookahead.parse('ac');
                assert.equal(res.matched, false);
                assert.equal(res.remaining, 'ac');
            });
            it('"a&b" should fail if not "a"', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let lookahead = a.before(b);
                let res = lookahead.parse('cb');
                assert.equal(res.matched, false);
                assert.equal(res.remaining, 'cb');
            });
            it('should be nullable if the first is nullable', function() {
                let a = new Terminal('a');
                let nullable = new Empty();
                assert.equal(a.before(a).nullable, false);
                assert.equal(a.before(nullable).nullable, false);
                assert.equal(nullable.before(a).nullable, true);
                assert.equal(nullable.before(nullable).nullable, true);
            });
        });
    });
    describe('Not', function() {
        describe('#parse()', function() {
            it('"a!b" should fail if "a" then "b"', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let cut = a.notBefore(b);
                let res = cut.parse('ab');
                assert.equal(res.matched, false);
                assert.equal(res.remaining, 'ab');
            });
            it('"a!b" should pass if "a" then not "b"', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let cut = a.notBefore(b);
                let res = cut.parse('ac');
                assert.equal(res.matched, true);
                assert.equal(res.remaining, 'c');
            });
            it('"a!b" should fail if not "a"', function() {
                let a = new Terminal('a');
                let b = new Terminal('b');
                let cut = a.notBefore(b);
                let res = cut.parse('x');
                assert.equal(res.matched, false);
                assert.equal(res.remaining, 'x');
            });
            it('should be nullable if the first is nullable', function() {
                let a = new Terminal('a');
                let nullable = new Empty();
                assert.equal(a.notBefore(a).nullable, false);
                assert.equal(a.notBefore(nullable).nullable, false);
                assert.equal(nullable.notBefore(a).nullable, true);
                assert.equal(nullable.notBefore(nullable).nullable, true);
            });
        });
    });
    describe('NTimes', function() {
        describe('#parse()', function() {
            it('should match anything 0 times', function() {
                let a = new Terminal('a');
                let zero_a = a.times(0);
                assert.equal(zero_a.parse('asdf').matched, true);
                assert.equal(zero_a.parse('asdf').remaining, 'sdf');
                
                assert.equal(zero_a.match('').matched, true);
                assert.equal(zero_a.match('').remaining, '');
            });
            it('should match with 1 times', function() {
                let a = new Terminal('a');
                let one_a = a.times(1);
                assert.equal(one_a.parse('asdf').matched, true);
                assert.equal(one_a.parse('asdf').remaining, 'sdf');
            });
            it('should match multiple times', function() {
                let a = new Terminal('a');
                let one_a = a.times(1);
                let zero_a = a.times(0);

                assert.equal(one_a.parse('aaaas').matched, true);
                assert.equal(one_a.parse('aaaas').remaining, 's');

                assert.equal(zero_a.parse('aaaas').matched, true);
                assert.equal(zero_a.parse('aaaas').remaining, 's');
            });
            it('should fail if not first', function() {
                let a = new Terminal('a');
                let one_a = a.times(1);
                let zero_a = a.times(0);

                assert.equal(one_a.parse('baaaas').matched, false);
                assert.equal(one_a.parse('baaaas').remaining, 'baaaas');

                assert.equal(zero_a.parse('baaaas').matched, true);
                assert.equal(zero_a.parse('baaaas').remaining, 'baaaas');
            });
        });
    });
    describe('Listeners', function() {
        it('should call callback on a match', function() {
            let a = new Terminal('a');
            let matched = false;
            a.listen((input, result) => {
                matched = true;
            });
            a.parse('a');
            assert.equal(matched, true);
        });
        it('should correctly attach attributes', function() {
            let a = new Terminal('a');
            a.listen((result, input) => {
                return result.result;
            });
            let res = a.parse('a');
            assert.equal(res.matched, true);
            assert.equal(res.attributes, 'a');
        });
    });
}
