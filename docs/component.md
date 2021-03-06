# Redone Component API

## Table of Contents
* [`static propTypes`](#static-proptypes)
* [`static stateTypes`](#static-statetypes)
* [`initialize()`](#initialize)
* [`compute(computation)`](#computecomputation)
* [`render()`](#render)
* [`componentWillMount()`](#componentwillmount)
* [`componentDidMount()`](#componentdidmount)
* [`componentDidUpdate()`](#componentdidupdate)
* [`componentWillUnmount()`](#componentwillunmount)
* [`setState(nextState, callback)`](#setstatenextstate-callback)

## Introduction
The following API describes how to define Redone components. It's important to note that this API is similar to React's [ES6 API](https://facebook.github.io/react/docs/reusable-components.html#es6-classes), but is not the same. **One major difference is the component class you write should not inherit from `React.Component`.** The actual React component is only created after calling the `compile` function.

## What's Missing?
* [Default props](https://github.com/facebook/react/issues/3725) - Implement the `initialize` function to set defaults.
* [Context](https://facebook.github.io/react/docs/context.html) - Use [higher-order components](https://facebook.github.io/react/docs/higher-order-components.html) instead.

### `static propTypes`
The **prop types** behave similarly to prop types in traditional React components, but the **props** are cast silently to fit the desired shape instead of throwing an error when a property value has the wrong type. The props object is cast using the `ReadOnlyShapeSchema`, which means all properties are read-only. Attempting to change any prop variables will result in an error.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'redone';
import { number } from 'redone/types';

const Counter = connect(
  class Counter {
    static propTypes = {
      value: number,
    };

    initialize() {
      console.log(this.props.value);
    }
  }
);

ReactDOM.render(<Counter value="2" />, document.body);
// 2
```

### `static stateTypes`
The **state types** define the shape of the **state**. It is cast using the `ReactiveShapeSchema`, which means any changes to the underlying structure are ignored. If no state types are specified, the state is set to `null`.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'redone';
import { string } from 'redone/types';

const App = connect(
  class App {
    static stateTypes = {
      user: {
        name: string,
      },
    };

    initialize() {
      console.log(this.state.user.name);
      this.state.user.name = 'Bob';
      console.log(this.state.user.name);
      this.state.user = null;
      console.log(this.state.user.name);
      this.state.user = {
        name: 'John',
        message: 'hello',
      };
      console.log(this.state.user.name);
      console.log(this.state.user.message);
    }
  }
);

ReactDOM.render(<App />, document.body);
// ''
// 'Bob'
// ''
// John
// undefined
```

### `initialize()`
The **initialize** function runs once while the component is being constructed. This is a good place to set default values for **props** and **state**.

### `compute(computation)`
The **compute** function runs immediately after the component has been constructed. The compute function runs inside an **autorun** and has access to the **computation** object. The compute function doesn't return anything and can also be asynchronous.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { compile } from 'redone';
import { bool } from 'redone/types';

const App = connect(React.Component)(
  class App {
    static stateTypes = {
      isLoading: bool,
    }

    async compute(comp) {
      this.state.isLoading = true;
      await Promise.resolve();
      comp.continue(() => {
        this.state.isLoading = false;
      });
    }

    render() {
      console.log(this.state.isLoading);
      return (
        <div>
          {this.state.isLoading ? 'Loading...' : 'Hello world!'}
        </div>
      );
    }
  }
);

ReactDOM.render(<App />, document.body);
// true
// false
```

### `render()`
The **render** function is where most of your presentational logic should exist. The render function must return a React Element or `null`. Redone wraps the render function inside an autorun so that the component is automatically re-rendered when changes occur. In traditional React components, `render` is called when the component receives new props or the state has changed, but since these changes are already being tracked by the autorun, Redone uses `forceUpdate` to tell React to get the latest changes once new output has been rendered.

### `componentWillMount()`
Invoked before the component is mounted in the DOM. See [the docs](https://facebook.github.io/react/docs/component-specs.html#mounting-componentwillmount) for more information.

### `componentDidMount()`
Invoked after the component has mounted the DOM. See [the docs](https://facebook.github.io/react/docs/component-specs.html#mounting-componentdidmount) for more information.

### `componentDidUpdate()`
Invoked after the component is updated. See [the docs](https://facebook.github.io/react/docs/component-specs.html#updating-componentdidupdate) for more information.

### `componentWillUnmount()`
Invoked before the component is unmounted from the DOM. See [the docs](https://facebook.github.io/react/docs/component-specs.html#unmounting-componentwillunmount) for more information.

### `setState(nextState, callback)`
This function works just as expected, but it has an added benefit of updating all relevant properties on the state object in a batch so that `render` is called only once. The `callback` parameter is provided for backwards compatibility, but is unnecessary as changes are applied immediately.
