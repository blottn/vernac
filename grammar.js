// TODO change to use singular constructor
function Sequence(a,b) {
    this.first = a;
    this.second = b;

    this.match = function(input) {
        let res = a.match(input);
        if (res.matched) {
            return b.match(input.substring(res.index));
        }
    }
}



function Optional(a) {
    this.match = function(input) {
        let res = a.match(input);
        if (res.matched) {
            return res;
        }
        else {
            return {
                matched: true,
                txt : input
            };
        }
    }
}

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

module.exports = {
    Terminal : Terminal,
    Empty : Empty,
    Sequence : Sequence,
    OrderedChoice : OrderedChoice
};
