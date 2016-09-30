# Component API

## Table of Contents
* [`static propTypes`](#static-proptypes)
* [`static stateTypes`](#static-statetypes)
* [`static contextTypes`](#static-contexttypes)
* [`static childContextTypes`](#static-childcontexttypes)
* [`constructor(props, context)`](#constructorprops-context)
* [`compute(computation)`](#computecomputation)
* [`render`](#render)
* [`getChildContext`](#getchildcontext)
* [`componentWillMount`](#componentwillmount)
* [`componentDidUpdate`](#componentdidupdate)
* [`componentWillUnmount`](#componentwillunmount)
* [`setState`](#setstate)

## Introduction
The following API describes how to define Redone components. It's important to note that this API is similar to React's [ES6 API](https://facebook.github.io/react/docs/reusable-components.html#es6-classes), but is not the same. **One major difference is the component class you write should not inherit from `React.Component`.** The actual React component is only created after calling the `connect` function.

### `static propTypes`
The **prop types** behave similarly to prop types in traditional React components, but the **props** are cast silently to fit the desired shape instead of throwing an error when a property value has the wrong type. The props object is cast using the `ReadOnlyShapeSchema`, so all properties are read-only. Attempting to change any prop variables will result in an error.

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

    constructor(props) {
      console.log(props.value);
    }
  }
);

ReactDOM.render(<Counter value="2" />, document.body);
// 2
```

### `static stateTypes`
The **state types** define the shape of the **state**. The state object is read-only and cannot be replaced, but its properties can be changed. It is cast using the `ReactiveShapeSchema`, so any changes to the underlying structure are ignored. If no state types are specified, the state is set to `null`.

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

    constructor() {
      console.log(state.user.name);
      state.user.name = 'Bob';
      console.log(state.user.name);
      state.user = null;
      console.log(state.user.name);
      state.user = {
        name: 'John',
        message: 'hello',
      };
      console.log(state.user.name);
      console.log(state.user.message);
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

### `static contextTypes`
The **context types** are similar to the prop types and state types, except the type object is also converted to an object of React types so that React knows to pass down the desired context variables. The resulting shape schema is then used to cast the **context** to ensure the correct shape. The context is cast using the `ReadOnlyShapeSchema`, so all properties are read-only. Attempting to change any context variables will result in an error. If no context types are specified, the context object is set to `null`.

### `static childContextTypes`
The **childContextTypes** is also converted to React types to satisfy the type requirements to make context variables work. The output of `getChildContext` is not cast however.

### `constructor(props, context)`
The **constructor** runs while the component is being initialized. One small deviation from traditional React components is that the **props**, **context**, and **state** are already set by the time the constructor is called.

### `compute(computation)`
The **compute** function runs immediately after the constructor. However unlike the constructor, the compute function runs inside an **autorun** and has access to the **computation** object. The compute function doesn't return anything and can be used to run asynchronous computations.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'redone';
import { bool } from 'redone/types';

const App = connect(
  class App {
    static stateTypes = {
      isLoading: bool,
    }

    async compute() {
      this.state.isLoading = true;
      await Promise.resolve();
      this.state.isLoading = false;
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

### `render`
This is the famous render function where most of your presentational logic will exist. The render function must return a `string`, `null`, or a React Element. Redone wraps this inside an autorun so that the component is automatically re-rendered when changes occur. In traditional React components, `render` is called when the component receives new props or the state is changed, but since these changes are already being tracked by the autorun, Redone uses `forceUpdate` to tell React to get the latest changes once new output has been rendered. See [the docs](https://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html) for more information.

### `getChildContext`
React calls this function during the render process in order to pass context variables down the tree. Redone wraps this in an autorun so that changes to the computed object are automatically passed down the tree. See [the docs](https://facebook.github.io/react/docs/context.html) to learn more about how the context works.

### `componentWillMount`
Invoked before the component is mounted in the DOM. See [the docs](https://facebook.github.io/react/docs/component-specs.html#mounting-componentwillmount) for more information.

### `componentDidMount`
Invoked after the component has mounted the DOM. See [the docs](https://facebook.github.io/react/docs/component-specs.html#mounting-componentdidmount) for more information.

### `componentDidUpdate`
Invoked after the component is updated. See [the docs](https://facebook.github.io/react/docs/component-specs.html#updating-componentdidupdate) for more information.

### `componentWillUnmount`
Invoked before the component is unmounted from the DOM. See [the docs](https://facebook.github.io/react/docs/component-specs.html#unmounting-componentwillunmount) for more information.

### `setState(nextState, callback)`
This function works just as expected, but it has an added benefit of updating all relevant properties on the state object in a batch so that `render` is called only once. The `callback` parameter is also unnecessary as changes are applied immediately.
