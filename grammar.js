function Sequence(a,b) {
    this.first = a;
    this.second = b;

    this.match = function(input, callback) {
        callback(a.match(input, b.match));
    }
}

// primitives
function Empty() {
    this.match = function(input, callback) {
        return input;
    }
}

function Terminal(string) {
    this.terminal = string;
    this.match = function(input, callback) {
        if (input.match(new RegExp('^' + this.terminal))) {
            return input.substring(string.length);
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
    Sequence : Sequence
};
