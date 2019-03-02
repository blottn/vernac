# Idiom

## Description
Simple DSL for creating parsing expression grammars

## Usage
Build up parsing expressions using the functions

eg:
```Javascript
let sum = Terminal('\\d').then('+').then(Terminal('\\d'));
```
