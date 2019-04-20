/*  Filename: vernac.js
    Directory: ./
    Author: Nicholas Blott
    Email: blottn@tcd.ie
    Description: DSL for creating parsers
*/

// result constructor
class Result {
    constructor(matched, result, remaining, ast) {
        this.matched = matched;
        this.result = result;
        this.remaining = remaining;
        this.ast = ast;
    }
}

// grammar 
class Grammar {
    constructor() {
        this.nullable = false;
        this.listener = (r) => r.ast;
    }

    // internal matcher, strict indicates if it should match only if at start
    match(input, strict = false) {
        return new Result(true, '', input);
    }

    parse(input, strict = false) {
        let res = this.match(input, strict);
        if (res.matched) {
            res.ast = this.listener(res);
        }
        return res;
    }

    // wrappers to make construction of parsers easier to understand

    or(alternative, listener) {
        return new OrderedChoice(this, this.check(alternative), listener);
    }
:
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

    // default listener
    default_listener(r) {
        return r.ast;
    }

    // syntactic sugar to allow use of strings instead 
    // of having to create a terminal everytime
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

    match(input, strict) {
        return this.subGrammar.match(input,strict);
    }

}


// matches just a primitive regular expression
class Terminal extends Grammar {
    constructor(word, listener) {
        super();
        this.word = word;
        this.re = new RegExp('^' + word);
        this.nullable = word === '';
        this.listener = listener || this.default_listener;
    }
    
    match(input, strict) {
        let res = this.re.exec(input);
        if (res) {
            let matched = res.index == 0 || !strict;
            return new Result(matched, res[0], input.substring(res.index + res[0].length));
        }
        else {
            return new Result(false, '', input);
        }
    }

    default_listener(r) {
        return r.result;
    }
}

class Empty extends Terminal {
    constructor(listener) {
        super('');
        this.listener = listener || this.default_listener;
        this.nullable = true;       
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

    match(input) { // constructs array of results and counts how many there are
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
}

// Order
class OrderedChoice extends Grammar {
    constructor(a,b, listener) {
        super();
        this.listener = listener || this.default_listener;
        this.first = a;
        this.second = b;
        this.nullable = a.nullable || b.nullable;
    }

    // try to match the first, otherwise match the second
    match(input, strict) {
        let res = this.first.parse(input, strict);
        if (res.matched) {
            return res;
        }
        else {
            return this.second.parse(input, strict);
        }
    }
}

class Sequence extends Grammar {
    constructor(a,b, listener) {
        super();
        this.listener = listener || this.default_listener;
        this.first = a;
        this.second = b;
        this.nullable = a.nullable && b.nullable;
    }

    // match only if it matches a then b
    match(input, strict) {
        let res = this.first.parse(input, strict);
        if (res.matched) {
            let second_res = this.second.parse(res.remaining, strict);
            if (second_res.matched) {
                second_res.ast = {left: res.ast, right: second_res.ast};
                second_res.result = res.result + second_res.result;
                return second_res;
            }
            else {
                return new Result(false, '', input);
            }
        }
        else {
            return res;
        }
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
}

module.exports = {
    Terminal : Terminal,
    Empty : Empty,
};
