class Result {
    constructor(matched, remaining) {
        this.matched = matched;
        this.remaining = remaining;
    }
}

class Grammar {
    constructor() {
        this.nullable = false;
    }

    match(input, strict = false) {
        return new Result(true, input);
    }

    parse(input, strict = false) {
        let res = this.match(input, strict);
        if (res.matched)
            this.onMatch(input, res);
        return res;
    }
    onMatch(input, result) {
        (this.listener ? this.listener(input, result) : undefined);
    }

    or(alternative) {
        return new OrderedChoice(this,alternative);
    }

    then(next) {
        return new Sequence(this,next);
    }

    optionally() {
        return new Optional(this);
    }

    before(next) {
        return new Lookahead(this,next);
    }

    notBefore(next) {
        return new Not(this, next);
    }

    times(n) {
        return new NTimes(this, n);
    }

    listen(listener) {
        this.listener = listener;
    }
}

// Primitives
class Terminal extends Grammar {
    constructor(word) {
        super();
        this.word = word;
        this.re = new RegExp('^' + word);
        this.nullable = word === '';
    }
    
    match(input, strict) {
        let res = this.re.exec(input);
        if (res) {
            let matched = res.index == 0 || !strict;
            return new Result(matched, input.substring(res.index + this.word.length));
        }
        else {
            return new Result(false, input);
        }
    }
}

class Empty extends Terminal {
    constructor() {
        super('');
        this.nullable = true;       
    }
}

// Count operators
class Optional extends Grammar {
    constructor(subGrammar) {
        super();
        this.subGrammar = subGrammar;
        this.nullable = true;
    }

    match(input, strict) {
        let res = this.subGrammar.parse(input, strict);
        if (res.matched) {
            return res;
        }
        else {
            return new Result(true, input);
        }
    }
}

class NTimes extends Grammar {
    constructor(grammar, count) {
        super();
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
        for (res = this.grammar.parse(input, true) ; res.matched; res = this.grammar.parse(res.remaining, true)) {
            matches++;
            res = this.grammar.parse(res.remaining, true);
        }
        if (matches >= this.count) {
            return new Result(true, res.remaining);
        }
        return new Result(false, input);
    }
}

// Order
class OrderedChoice extends Grammar {
    constructor(a,b) {
        super();
        this.first = a;
        this.second = b;
        this.nullable = a.nullable || b.nullable;
    }

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
    constructor(a,b) {
        super();
        this.first = a;
        this.second = b;
        this.nullable = a.nullable && b.nullable;
    }

    match(input, strict) {
        let res = this.first.parse(input, strict);
        if (res.matched) {
            let second_res = this.second.parse(res.remaining, strict);
            if (second_res.matched) {
                return second_res;
            }
            else {
                return new Result(false, input);
            }
        }
        else {
            return res;
        }
    }
}

// Lookaheads
class Lookahead extends Grammar{
    constructor(current, forward) {
        super();
        this.current = current;
        this.forward = forward;
        this.nullable = current.nullable;
    }

    match(input, strict) {
        let res = this.current.parse(input, strict);
        if (res.matched) {
            let forward_res = this.forward.parse(res.remaining, strict);
            if (forward_res.matched) {
                return new Result(true, res.remaining);
            }
        }
        return new Result(false, input);
    }
}

class Not extends Grammar {
    constructor(current, forward) {
        super();
        this.current = current;
        this.forward = forward;
        this.nullable = current.nullable;
    }
    
    match(input, strict) {
        let res = this.current.parse(input, strict);
        if (res.matched) {
            let forward_res = this.forward.parse(res.remaining, strict);
            if (!forward_res.matched) {
                return new Result(true, res.remaining);
            }
        }
        return new Result(false, input);
    }
}

module.exports = {
    Terminal : Terminal,
    Empty : Empty,
};
