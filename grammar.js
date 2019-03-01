class Result {
    constructor(matched, remaining) {
        this.matched = matched;
        this.remaining = remaining;
    }
}

class Grammar {
    constructor() {}

    match(input) {
        return new Result(true, input);
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
}

// Primitives
class Terminal extends Grammar {
    constructor(word) {
        super();
        this.word = word;
        this.re = new RegExp('^' + word);
    }
    
    match(input) {
        let res = this.re.exec(input);
        if (res) {
            return new Result(true, input.substring(res.index + this.word.length));
        }
        else {
            return new Result(false, input);
        }
    }
}

class Empty extends Terminal {
    constructor() {
        super('');
    }
}

// Count operators
class Optional extends Grammar {
    constructor(subGrammar) {
        super();
        this.subGrammar = subGrammar;
    }

    match(input) {
        let res = this.subGrammar.match(input);
        if (res.matched) {
            return res;
        }
        else {
            return new Result(true,input);
        }
    }
}

class OrderedChoice extends Grammar {
    constructor(a,b) {
        super();
        this.first = a;
        this.second = b;
    }

    match(input) {
        let res = this.first.match(input);
        if (res.matched) {
            return res;
        }
        else {
            return this.second.match(input);
        }
    }
}

class Sequence extends Grammar {
    constructor(a,b) {
        super();
        this.first = a;
        this.second = b;
    }

    match(input) {
        let res = this.first.match(input);
        if (res.matched) {
            let second_res = this.second.match(res.remaining);
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
class Not extends Grammar {
    constructor(current, forward) {
        super();
        this.current = current;
        this.forward = forward;
    }
    
    match(input) {
        let res = this.current.match(input);
        if (res.matched) {
            let forward_res = this.forward.match(res.remaining);
            if (!forward_res.matched) {
                return new Result(true, res.remaining);
            }
        }
        return new Result(false, input);
    }
}

class Lookahead extends Grammar{
    constructor(current, forward) {
        super();
        this.current = current;
        this.forward = forward;
    }

    match(input) {
        let res = this.current.match(input);
        if (res.matched) {
            let forward_res = this.forward.match(res.remaining);
            if (forward_res.matched) {
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
