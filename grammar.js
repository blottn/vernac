// TODO change to use singular constructor
function Sequence(a,b) {
    this.first = a;
    this.second = b;

    this.match = function(input, callback) {
        let res = a.match(input);
        if (res.matched) {
            return b.match(input.substring(res.index));
        }
    }
}

function OrderedChoice(a,b) {
    this.first = a;
    this.second = b;
    this.match = function(input, callback) {
        let res;
        if (res = this.first.match(input))
            return res;
        else if (res = this.second.match(input))
            return res;
        else {
            return '';
        }
    }
}

function Optional(a) {
    this.match = function(input,callback) {
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

// primitives
function Empty() {
    this.match = function(input, callback) {
        return input;
    }
}

function Terminal(string) {
    this.terminal = new RegExp('^' + string);
    this.match = function(input, callback) {
        if (input.match(this.terminal)) {
            return {
                matched : true,
                txt : input.substring(string.length)
            };
        }
        else {
            // error until matched
            // something todo with continue from here
            input.indexOf(this.terminal);
        }
    }
}

module.exports = {
    Terminal : Terminal,
    Empty : Empty,
    Sequence : Sequence,
    OrderedChoice : OrderedChoice
};
