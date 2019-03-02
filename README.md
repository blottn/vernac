# Idiom

## Description
Simple DSL for creating parsing expression grammars

## Usage
Build up parsing expressions using the functions

eg:
```Javascript
let sum = Terminal('\\d').then('+').then(Terminal('\\d'));
sum.listen(() => {
    console.log('matched');
}

sum.parse("1+2");
// stdout >> 'matched'
```

## API

### Primitives

#### `Terminal`


#### `Empty`

