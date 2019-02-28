# Idiom

## Description
Simple DSL for creating parsing expression grammars

## Usage
Build up parsing expressions using the functions

eg:
```Javascript
let sum = Ordered(Terminal(/\d/),Terminal(/+/),Terminal(/\d/));
```
