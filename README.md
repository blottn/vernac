# Idiom

## Description
Simple DSL for creating parsing expression grammars

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

### Primitives

#### `Terminal`

Matches a basic symbol, eg a number is:

`let num = new Terminal('\\d')`

or more complicated regex:

`let ident = new Terminal('[A-Za-z]+\\w*');`

#### Empty

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

### Combinations

We can now combine these to make more complicated expressions.
Here are all the basic combinators:


