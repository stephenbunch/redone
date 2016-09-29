# Redone

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]

## Table of Contents
* [Introduction](#introduction)
* [Autoruns](#autoruns)
  * [A simple example](#a-simple-example)
  * [Forked computations](#forked-computations)
  * [Async computations](#async-computations)
* [Types](#types)
  * [`any`](#any)
  * [`arrayOf(type)`](#arrayoftype)
  * [`bool`](#bool)
  * [`date`](#date)
  * [`func`](#func)
  * [`funcOf(type)`](#funcoftype)
  * [`instanceOf(type)`](#instanceoftype)
  * [`nullableOf(type)`](#nullableoftype)
  * [`number`](#number)
  * [`object`](#object)
  * [`optionalOf(type)`](#optionaloftype)
  * [`string`](#string)
  * [`shape(spec)`](#shapespec)
* [`connect(class)`](#connectclass)


## Introduction
Redone builds on the [Tracker architecture](https://github.com/meteor/docs/blob/version-NEXT/long-form/tracker-manual.md) developed by Meteor and integrates it with React. Rather than focus on providing consistent state as is the case with Flux and Redux, Redone focuses on providing consistent computations. It does this by decoupling data providers from their consumers, localizing state, disallowing circular data dependencies, and enforcing contracts at runtime.

## Autoruns
An **autorun** is a runner that executes a block of code whenever **dependencies** of that block change. Think of it like webpack in "watch mode" and how it rebuilds the bundle whenever an imported file changes. In this analogy, webpack is the autorun, the build is an arbitrary function, and the files are just variables in your app.

To create an autorun, you pass a callback. When the autorun is created, the callback is run immediately. During execution, dependencies are tracked by the autorun. Whenever a dependency changes, the autorun is notified and the callback is rerun.

Autoruns don't return values, they set them.

Once you're inside an autorun, you have access to a **computation** object. This object can be used spin off child autoruns (called **forks**) or string together multiple segments of an async computation. A fork is like a forked process. It does its own thing, but its lifecycle is synced with the parent. If the parent is cleaned up, the fork is cleaned up as well. With async computations, later segments are automatically skipped once a computation is rerun. This ensures that you never have reruns finishing in the wrong order.

### A simple example
```js
import { Autorun, Dependency } from 'redone';

let colorDep = new Dependency();
let color = 'blue';

function getColor() {
  colorDep.depend();
  return color;
}

function setColor(value) {
  if (color !== value) {
    color = value;
    colorDep.changed();
  }
}

let autorun = Autorun.start(() => {
  console.log(getColor());
});
// "blue"

setColor('red');
// "red"

autorun.dispose();
setColor('green');
// (nothing printed)
```

### Forked computations
```js
import { Autorun, Dependency } from 'redone';

let dep1 = new Dependency();
let dep2 = new Dependency();
let dep3 = new Dependency();

let autorun = Autorun.start(comp => {
  dep1.depend();
  console.log('run comp');

  comp.fork(childComp => {
    dep2.depend();
    console.log('run child comp');

    childComp.fork(() => {
      dep3.depend();
      console.log('run grandchild comp');
    });
  });
});
// "run comp"
// "run child comp"
// "run grandchild comp"

dep3.changed();
// "run grandchild comp"

dep2.changed();
// "run child comp"
// "run grandchild comp"

dep1.changed();
// "run comp"
// "run child comp"
// "run grandchild comp"

autorun.dispose();
dep3.changed();
// (nothing printed)
dep2.changed();
// (nothing printed)
dep1.changed();
// (nothing printed)
```

### Async computations
```js
import { Autorun, Dependency } from 'redone';

let dep1 = new Dependency();
let dep2 = new Dependency();
let count = 0;

let autorun = Autorun.start(async comp => {
  dep1.depend();
  await Promise.resolve();

  comp.continue(() => {
    console.log('continued', ++count);
  });
});

await autorun.value;
// "continued", 1

dep1.changed();
dep1.changed();
await autorun.value;
// "continued", 2

dep2.changed();
await autorun.value;
// "continued", 3

dep1.changed();
autorun.dispose();
await autorun.value;
// (nothing printed)
```

## Types
Types work a bit differently in Redone than in React. In React, types are used to assert that a property is of a certain type. In Redone, types are used to *ensure* that a given property is of the correct type. In other words, if you throw a string at a number type, the number schema will intelligently convert the string to a number rather than throwing an error. Redone focuses on allowing you to mutate a value, but not its type.

You can convert from Redone types to React types using `utils/getReactTypes`, but you cannot convert the other way around due to the way React types are represented.

### `any`
A schema that allows any type.
```js
import { any } from 'redone/types';

const obj = {};
const val = any.cast(obj); // val === obj
```

### `arrayOf(type)`
Generates a schema that ensures that a value is an array of a given type.
```js
import { arrayOf, number } from 'redone/types';

const numbers = arrayOf(number);
numbers.cast(); // []
numbers.cast(['2', 'foo', 3]); // [2, 0, 3]
```

### `bool`
A schema that ensures that a value is a boolean.
```js
import { boolean } from 'redone/types';

bool.cast(''); // false
bool.cast(' '); // true
bool.cast(0); // false
bool.cast(1); // true
```

### `date`
A schema that ensures that a value is a date.
```js
import { date } from 'redone/types';

date.cast(null); // Wed Dec 31 1969 16:00:00 GMT-0800 (PST)
```

### `func`
A schema that ensures that a value is a function. If a value is not a function, an empty function is returned.
```js
import { func } from 'redone/types';

func.cast('foo'); // () => {}
```

### `funcOf(type)`
Generates a schema that ensures that a value is a function that returns a specific type.
```js
import { funcOf, number } from 'redone/types';

const func = () => '3';
funcOf(number).cast(func)(); // 3
```

### `instanceOf(type)`
Generates a schema that asserts a value to be an instance of a certain type. **This schema throws an error instead of doing an implicit cast.**
```js
import { instanceOf } from 'redone/types';

class Foo {}
const foo = instanceOf(Foo);

foo.cast('foo'); // throws error

const instance = new Foo();
foo.cast(instance); // instance
```

### `nullableOf(type)`
Generates a schema that ensures that a value is either `null` or the given type.
```js
import { nullableOf, string } from 'redone/types';

const nullableString = nullableOf(string);
nullableString.cast(''); // ''
nullableString.cast(null); // null
nullableString.cast(); // null
```

### `number`
A schema that ensures that a value is a number. Although `NaN` is a valid number, it's generally not useful, so this schema converts `NaN` to `0`.
```js
import { number } from 'redone/types';

number.cast(''); // 0
number.cast('1'); // 1
number.cast('1foo'); // 0
number.cast(NaN); // 0
```

### `object`
A schema that ensures that a value is an object. Although `null` is technically an object, the expectation is to return an empty object. Unlike `types/shape`, `types/object` doesn't cast any of its members and returns the same object instance rather than creating a copy.
```js
import { object } from 'redone/types';

const obj = {};
object.cast(obj); // obj
object.cast(null); // {}
```

### `optionalOf(type)`
Generates a schema that ensures that a value is either `undefined` or the given type.
```js
import { optionalOf, number } from 'redone/types';

const optionalNumber = optionalOf(number);
optionalNumber.cast(0); // 0
optionalNumber.cast(null); // 0
optionalNumber.cast(); // undefined
```

### `shape(spec)`
Generates a schema that ensures that a value is an object with a given shape.
```js
import { shape, number } from 'redone/types';

const type = shape({
  foo: number,
});
type.cast(); // { foo: 0 }
type.cast({ foo: '3' }); // { foo: 3 }
type.cast({ bar: 2, foo: 4 }); // { foo: 4 }
```

### `string`
A schema that ensures that a value is a string.
```js
import { string } from 'redone/types';

string.cast(0); // '0'
string.cast(1); // '1'
string.cast(null); // ''
string.cast(); // ''
```

## `connect(class)`
Generates a new React Component class using the specified class as a template. For the most part, the API matches React's [ES6 API](https://facebook.github.io/react/docs/reusable-components.html#es6-classes). The differences are:

* The class should not inherit from `React.Component`.
* `stateTypes` must be set in order to use the `state` object.
* `this.props`, `this.state`, and `this.context` are all instances of `ReactiveShape` or `null` if no "types" are set.
* `this.setState` can be used to update a group of properties at once, but normal assignment works as well and is preferred when updating single values.
* `componentWillReceiveProps`, `shouldComponentUpdate`, `componentWillUpdate`, and `this.forceUpdate` are not supported since they go against the autorun paradigm.
* `mixins` are not supported. Object composition is a much better strategy than multiple inheritance.
* `compute`, `render`, and `getChildContext` are all run inside separate autoruns.
* The `compute` hook is the only function that can be async and has access to the computation object.

```js
import React from 'react';
import { connect } from 'redone';
import { number } from 'redone/types';

class Counter {
  static propTypes = {
    initialValue: number,
  };

  static stateTypes = {
    value: number,
    square: number,
  };

  constructor(props) {
    this.state.value = props.initialValue;
  }

  compute() {
    this.state.square = Math.pow(this.state.value, 2);
  }

  render() {
    return (
      <div>
        Value: {this.state.value}<br />
        Square: {this.state.square}<br />
        <button onClick={() => this.state.value += 1}>add</button>
      </div>
    );
  }
}

export default connect(Counter);
```

[npm-image]: https://img.shields.io/npm/v/redone.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/redone
[travis-image]: https://img.shields.io/travis/stephenbunch/redone.svg?style=flat-square
[travis-url]: https://travis-ci.org/stephenbunch/redone
[codecov-image]: https://img.shields.io/codecov/c/github/stephenbunch/redone.svg?style=flat-square
[codecov-url]: https://codecov.io/github/stephenbunch/redone
