// set helper
function union(a, b) {
    let out = new Set(a);
    for (let e of b) {
        out.add(e);
    }
    return out;
}


class Result {
    constructor(result, remaining, ast = result) {
        this.result = result;
        this.remaining = remaining;
        this.ast = ast;
    }
}

class PartialResult {
    constructor(skipped, result, remaining, ast = result) {
        this.skipped = skipped;
        this.result = result;
        this.remaining = remaining;
        this.ast = ast;
    }
}

class Failure {
    constructor() {}
}

class Grammar {
    constructor() {
        this.nullable = false;
        this.listener = (r) => {
            return {
                ast: r.ast,
                error: false
            };
        };
    }

    parse(input) {
        return new Result('', input, null);
    }

    or(alternative, listener) {
        return new OrderedChoice(this, this.check(alternative), listener);
    }

    then(next, listener) {
        return new Sequence(this, this.check(next), listener);
    }

    optionally(listener) {
        return new Optional(this, listener);
    }

    before(next, listener) {
        return new Lookahead(this, this.check(next), listener);
    }

    notBefore(next, listener) {
        return new Not(this, this.check(next), listener);
    }

    times(n, listener) {
        return new NTimes(this, n, listener);
    }

    listen(listener) {
        return new NonTerminal(this, listener);
    }

    default_listener(r) {
        return {
            ast: r.ast,
            error: false
        };
    }

    first() {
        return undefined;
    }

    baseError() {
        return this.first() + ' expected';
    }

    check(item) {
        if (typeof item === 'string')
            return new Terminal(item);
        else
            return item;
    }
}

// Primitives
class NonTerminal extends Grammar {
    constructor(subGrammar, listener) {
        super();
        this.subGrammar = subGrammar;
        this.nullable = subGrammar.nullable;
    }
    
    first() {
        return subGrammar.first();
    }

    parse(input) {
        return this.subGrammar.parse(input,strict);
    }
}

class Terminal extends Grammar {
    constructor(word, listener) {
        super();
        this.word = word;
        this.re = new RegExp('^' + word);
        this.nullable = word === '';
        this.listener = listener || this.default_listener;
    }
    
    parse(input) {
        let res = this.re.exec(input);
        if (res) {
            if (res.index == 0) {
                return new Result(res[0], input.substring(res[0].length));
            }
            else {
                let skipped = input.substring(0,res.index);
                let remainder = input.substring(res.index + res[0].length);
                return new PartialResult(skipped, res[0], remainder);
            }
        }
        else {
            return new Failure();
        }
    }

    first() {
        return new Set([this.word]);
    }

    default_listener(r) {
        return {
            ast: r.result,
            error: false
        };
    }
}

class Empty extends Terminal {
    constructor(listener) {
        super('');
        this.listener = listener || this.default_listener;
        this.nullable = true;
    }
    
    parse(input) {
        return new Result('', input);
    }

    first() {
        return new Set('');
    }
}

// Count operators
class Optional extends Grammar {
    constructor(subGrammar, listener) {
        super();
        this.listener = listener || this.default_listener;
        this.subGrammar = subGrammar;
        this.nullable = true;
    }

    first() {
        return new Set(this.subGrammar.first());
    }

    match(input, strict) {
        let res = this.subGrammar.parse(input, strict);
        if (res.matched) {
            return res;
        }
        else {
            return new Result(true, '', input);
        }
    }
}

class NTimes extends Grammar {
    constructor(grammar, count, listener) {
        super();
        this.listener = listener || this.default_listener;
        this.grammar = grammar;
        if (this.grammar.nullable) {
            throw new TypeError('Invalid grammar');
        }
        this.count = count;
        this.nullable = count > 0;
    }

    match(input) {
        let matches = 0;
        let res;
        let matched = '';
        let asts = [];
        for (res = this.grammar.parse(input, true) ; res.matched; res = this.grammar.parse(res.remaining, true)) {
            matches++;
            matched += res.result;
            
            asts = asts.concat(res.ast);
        }
        if (matches >= this.count) {
            return new Result(true, matched, res.remaining, asts);
        }
        return new Result(false, '', input, []);
    }

    first() {
        let f = new Set(this.grammar.first());
        if (this.count == 0) {
            f.add('');
        }
        return f;
    }
}

// Order
class OrderedChoice extends Grammar {
    constructor(a,b, listener) {
        super();
        this.listener = listener || this.default_listener;
        this.left = a;
        this.right = b;
        this.nullable = a.nullable || b.nullable;
    }

    match(input, strict) {
        let res = this.left.parse(input, strict);
        if (res.matched) {
            return res;
        }
        else {
            return this.right.parse(input, strict);
        }
    }

    first() {
        return union(this.left.first(), this.right.first());
    }
}

class Sequence extends Grammar {
    constructor(a,b, listener) {
        super();
        this.listener = listener || this.default_listener;
        this.left = a;
        this.right = b;
        this.nullable = a.nullable && b.nullable;
    }

    match(input, strict) {
        let res = this.left.parse(input, strict);
        if (res.matched) {
            let second_res = this.right.parse(res.remaining, strict);
            if (second_res.matched) {
                second_res.ast = {left: res.ast, right: second_res.ast};
                second_res.result = res.result + second_res.result;
                return second_res;
            }
            else {
                second_res.remaining = input;
                return second_res;
            }
        }
        else {
            return res;
        }
    }

    first() {
        if (this.left.nullable) {
            return union(this.left.first(), this.right.first());
        }
        return this.left.first();
    }
}

// Lookaheads
class Lookahead extends Grammar{
    constructor(current, forward, listener) {
        super();
        this.listener = listener || this.default_listener;
        this.current = current;
        this.forward = forward;
        this.nullable = current.nullable;
    }

    match(input, strict) {
        let res = this.current.parse(input, strict);
        if (res.matched) {
            let forward_res = this.forward.parse(res.remaining, strict);
            if (forward_res.matched) {
                return res;
            }
        }
        return new Result(false, '', input);
    }

    first() {
        return this.current.first();
    }
}

class Not extends Grammar {
    constructor(current, forward, listener) {
        super();
        this.listener = listener || this.default_listener;
        this.current = current;
        this.forward = forward;
        this.nullable = current.nullable;
    }
    
    match(input, strict) {
        let res = this.current.parse(input, strict);
        if (res.matched) {
            let forward_res = this.forward.parse(res.remaining, strict);
            if (!forward_res.matched) {
                return res;
            }
        }
        return new Result(false, '', input);
    }

    first() {
        return this.current.first();
    }
}

module.exports = {
    NonTerminal : NonTerminal,
    Terminal : Terminal,
    Empty : Empty,
};
