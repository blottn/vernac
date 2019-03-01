function Not(a) {
    this.match = function(input) {
        let res = a.match(input);
        if (res.matched) {
            return ''; // fail
        }
        else {
            return {
                matched : true,
                txt : input
            };
        }
    }
}

function And(a, b) {
    this.match = function(input) {
        let res = a.match(input);
        if (res.matched) {
            return res;
        }
        else {
            return '';
        }
    }
}

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
}

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

module.exports = {
    Terminal : Terminal,
    Empty : Empty,
    Sequence : Sequence,
    Optional : Optional,
    OrderedChoice : OrderedChoice
};
