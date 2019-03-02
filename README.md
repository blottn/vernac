# Vernac
A simple DSL for creating parsing expression grammars

## Usage
Build up parsing expressions using the functions

eg:
```Javascript
let sum = Terminal('\\d').then('\\+').then(Terminal('\\d'));
sum.listen(() => {
    console.log('matched');
}

sum.parse("1+2");
// stdout >> 'matched'
```

## API


### Terminal

Matches a basic symbol, eg a number is:

`let num = new Terminal('\\d')`

or more complicated regex:

`let ident = new Terminal('[A-Za-z]+\\w*');`

### Empty

Matches explicitly nothing, a synonymous with `new Terminal('');`

### Associated actions

We can add listeners for when a grammar matches.

```Javascript
let a = new Terminal('a');
a.listen((result_obj, input) => {
    console.log(result_obj); // Result {matched: true, result: 'a', remaining: ''}
});
a.parse('a');
```

### Ordered Choice
Noted as `a | b`. Tries for a first and then b.

#### Usage
```Javascript
let a = new Terminal('a');
let b = new Terminal('b');

let choice = a.or(b);

choice.parse('a'); // matches a
choice.parse('b'); // matches b
choice.parse('ab'); // matches a
```


### Sequence
Notes as `ab`. Needs to find a and then b.

#### Usage
```Javascript
let a = new Terminal('a');
let b = new Terminal('b');

let seq = a.then(b);

seq.parse('a'); // fails
seq.parse('b'); // fails
seq.parse('ab'); // succeeds
```

### Lookahead
Noted as `a&b`. Tries to find an `a` followed by a `b`. Only remembers the `a`.
Similar to sequence but only remembers the first.

#### Usage
```Javascript
let a = new Terminal('a');
let b = new Terminal('b');

let lookahead = a.before(b);

lookahead.parse('a') // fails
lookahead.parse('b') // fails
lookahead.parse('ab') // succeeds and returns 'a' with 'b' still to be parsed
```

### Negated Lookahead
Noted as `a!b`. Tries to find an `a` explicitly not followed by a `b`. Only
remembers the `a`.
Similar to lookahead but inverted.

#### Usage
```Javascript
let a = new Terminal('a');
let b = new Terminal('b');

let negated = a.before(b);

negated.parse('a'); // succeeds
negated.parse('b'); // fails
negated.parse('ab'); // fails
negated.parse('ac'); // succeeds and returns 'a' with 'c' still to be parsed
```

### 0 or more
Noted as `a*`. Tries to match `a` 0 or more times.

#### Usage
```Javascript
let a = new Terminal('a');

let zero_more = a.times(0);

zero_more.parse('a'); // succeeds and returns 'a'
zero_more.parse('ab'); // succeeds and returns 'a' with 'b' still to be parsed
zero_more.parse('aaac'); // succeeds and returns 'aaa' with 'c' still to be parsed
zero_more.parse(''); // succeeds
```

### 1 or more
Noted as `a+`. Tries to match `a` 1 or more times.

#### Usage
```Javascript
let a = new Terminal('a');

let one_more = a.times(1);

one_more.parse('a'); // succeeds and returns 'a'
one_more.parse('ab'); // succeeds and returns 'a' with 'b' still to be parsed
one_more.parse('aaac'); // succeeds and returns 'aaa' with 'c' still to be parsed
one_more.parse(''); // fails
```

### Optional
Noted as `a?`. Tries to match `a` 0 or 1 times.

#### Usage
```Javascript
let a = new Terminal('a');

let optional = a.optionally();

optional.parse('a'); // succeeds
optional.parse(''); // succeeds
optional.parse('aa'); // succeeds and returns 'a' with 'a' still to be parsed
optional.parse('ab'); // succeeds and returns 'a' with 'b' still to be parsed
optional.parse('b'); //succeeds and returns '' with 'b' still to be parsed
```
