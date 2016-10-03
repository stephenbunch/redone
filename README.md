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
  * [Preventing circular data dependencies](#preventing-circular-data-dependencies)
* [Types](#types)
* [Reactive shapes](#reactive-shapes)
* [`connect(class)`](#connectclass)
* [`renderAsync(element)`](#renderasyncelement)


## Introduction
Redone builds on the [Tracker architecture](https://github.com/meteor/docs/blob/version-NEXT/long-form/tracker-manual.md) developed by Meteor and integrates it with React. Rather than focus on providing consistent state mutations as is the case with Flux and Redux, Redone focuses on providing consistent relationships between components. It does this by decoupling data providers from consumers, disallowing circular data dependencies, and enforcing contracts at runtime. Unlike most React frameworks, Redone takes an [object-oriented](https://news.ycombinator.com/item?id=1355977) approach to UX, favoring local state and mutable components over global state and immutable components which are more appropriate for functional architectures.

## Autoruns
I recommend you first read [this intro](https://en.wikipedia.org/wiki/Reactive_programming) to **reactive programming**. If you have more time, you should also watch [this talk](https://www.youtube.com/watch?v=j3Q32brCUAI) by Conal Elliot on functional reactive programming. Lastly, here's [an intro](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754) to reactive programming using streams.

An **autorun** is a runner that executes a callback whenever **data dependencies** of that callback change. Think of it like webpack in "watch mode" and how it rebuilds the bundle whenever an imported file changes. In this analogy, webpack is the autorun, the build is the callback, and the files are just values in your app.

To create an autorun, you pass a callback. When the autorun is created, the callback is run immediately. During execution, dependencies are tracked by the autorun. Whenever a dependency changes, the autorun is notified and the callback is rerun.

It's important to note that the dependency object doesn't store any data itself. It's job is to let autoruns know when a piece of data is being depended on, and when it's time to rerun because the data changed. It doesn't manage the data itself.

**Autoruns don't return values, they set them.**

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
Once you're inside an autorun, you have access to a **computation** object. This object can be used spin off child autoruns (called **forks**) or string together multiple segments of an async computation. A fork is like a forked process. It reruns by itself, but its lifecycle is attached to the parent. If the parent is cleaned up, the fork is cleaned up as well.

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
With async computations, **continuations** are automatically skipped once a computation is rerun. This ensures that you never have an earlier async computation overwrite the results of a rerun in the event that the first run takes longer to resolve than the second.

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
// ^ this value is 2 instead of 3 because the autorun was rerun before the async call could finish

dep2.changed();
await autorun.value;
// "continued", 3

dep1.changed();
autorun.dispose();
await autorun.value;
// (nothing printed)
```

### Preventing circular data dependencies
Circular data dependencies between components create infinite loops. In large apps, they can be extremely difficult to track down because data might pass through several components before coming back around. One solution to this problem is the [Flux architecture](https://github.com/facebook/flux). With Flux, all mutations travel in the form of **actions** through a central dispatcher where circular dependencies can be squashed.

With Redone, because all reactions to mutation occur within a computation, we can easily check if we're reentering a computation and throw an error. This works well for both synchronous and asynchronous reactions.

```js
const dep = new Dependency();
Autorun.start(() => {
  dep.depend();
  dep.changed(); // throws an error
});
```

Circular dependencies in async computations:
```js
const dep = new Dependency();
Autorun.start(async comp => {
  dep.depend();
  await Promise.resolve();
  comp.continue(() => {
    dep.changed(); // throws an error
  });
});
```

Circular dependencies between multiple autoruns:
```js
const dep1 = new Dependency();
const dep2 = new Dependency();

const auto1 = Autorun.start(() => {
  dep1.depend();
  dep2.changed(); // throws an error on the 2nd time around
});

const auto2 = Autorun.start(() => {
  dep2.depend();
  dep1.changed(); // causes auto1 to run again which throws an error
});
```

## Types
Types work a bit differently in Redone than in React. In React, types are used to assert that a property is of a certain type. In Redone, types are used to *ensure* that a given property is of the correct type. In other words, if you throw a string at a number type, the number schema will intelligently convert the string to a number rather than throwing an error.

After using [Mongoose](http://mongoosejs.com/docs/guide.html) for MongoDB development in Node, I found that it's much easier to have a framework make sure your types are correct at runtime rather than littering type checks all over your codebase or using a compile-time type checker.

With Redone types, we can be confident that data entering through our props and coming from our state follow the type signatures we specified. This eliminates an entire class of bugs related to type errors. If some outside data has the wrong shape, we'll just see an empty component rather than crashing the page.

You can convert from Redone types to React types using `utils/getReactTypes`, but you cannot convert the other way around due to the way React types are represented.

```js
import { number } from 'redone/types';

console.log(number.cast('3'));
// 3

console.log(number.cast());
// 0
```

See the [Types API Reference](docs/types.md).

## Reactive shapes
**Reactive shapes** combine the power of Redone types and [properties](https://en.wikipedia.org/wiki/Property_(programming)) to create **indestructible** objects that hook into the Autorun system. In Redone components, the `props`, `state`, and `context` are all reactive shapes.

The following is a simplified example of how properties of reactive shapes are defined:
```js
import { Dependency } from 'redone';
import { number } from 'redone/types';

// This will be our reactive shape.
const obj = {};

// For now, let's just assume that our shape has a member called 'bar' which
// is a number.
const barDependency = new Dependency();
const barSchema = number;

// We'll setup another object to store our actual values.
const values = {
  bar: barSchema.cast()
};

// Now we define property accessors to proxy to our values.
Object.defineProperty(obj, 'bar', {
  get: () => {
    // Subscribe the current autorun to this property.
    barDependency.depend();
    return values.bar;
  },
  set: value => {
    // Cast the incoming value according to the schema for 'bar'.
    value = barSchema.cast(value);

    // If it's different than what we already have, update the values object
    // and send a notification that this property has changed.
    if (value !== values.bar) {
      values.bar = value;
      barDependency.changed();
    }
  }
});
```

And this is how you would use them:
```js
import { Autorun, schemas } from 'redone';
import { number } from 'redone/types';

const schema = new schemas.ReactiveShapeSchema({
  foo: new schemas.ReactiveShapeSchema({
    bar: number,
  }),
});

const state = schema.cast();

Autorun.start(() => {
  // Log 'bar' anytime 'foo' or 'bar' changes.
  console.log(state.foo.bar);
});
// 0

// 'bar' is indestructible. Setting 'bar' to the string '5' results in
// casting the string to a number.
state.foo.bar = '5';
// 5

// 'foo' is indestructible. Setting 'foo' to null results in casting null
// to an empty object with 'bar' set to 0.
state.foo = null;
// 0
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

See the [Component API Reference](docs/component.md).

## `renderAsync(element)`
With support for async computations, the default static render function provided by React won't work. Redone provides a utility method called `renderAsync` which walks the element tree multiple times until all async computations have completed.

```js
import { connect } from 'redone';
import { renderAsync } from 'redone/server';
import { number } from 'redone/types';

const Test = connect(
  class {
    static stateTypes = {
      value: number,
    };

    async compute() {
      this.state.value = await Promise.resolve(2);
    }

    render() {
      return <div>{this.state.value}</div>;
    }
  }
);

renderAsync(<Test />).then(result => console.log(result));
// '<div>2</div>'
```

[npm-image]: https://img.shields.io/npm/v/redone.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/redone
[travis-image]: https://img.shields.io/travis/stephenbunch/redone.svg?style=flat-square
[travis-url]: https://travis-ci.org/stephenbunch/redone
[codecov-image]: https://img.shields.io/codecov/c/github/stephenbunch/redone.svg?style=flat-square
[codecov-url]: https://codecov.io/github/stephenbunch/redone
