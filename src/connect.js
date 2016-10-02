import React from 'react';

import getReactTypes from './utils/getReactTypes';
import provideReactFacade from './internals/provideReactFacade';
import setClassName from './internals/setClassName';
import transformClass from './internals/transformClass';
import defaultSchemaFactory from './internals/defaultSchemaFactory';

export default function connect(Class, schemaFactory = defaultSchemaFactory) {
  if (typeof Class !== 'function') {
    throw new Error('Class must be a class.');
  }

  if (Class.prototype instanceof React.Component) {
    throw new Error('Class should not inherit from React.Component.');
  }

  const { ...statics } = Class;
  delete statics.propTypes;
  delete statics.stateTypes;
  delete statics.contextTypes;
  delete statics.childContextTypes;

  const Component = transformClass(Class, schemaFactory);
  const { contextTypes, childContextTypes } = Component;

  class ReactComponent extends React.Component {
    static contextTypes = contextTypes && getReactTypes(contextTypes);
    static childContextTypes = childContextTypes && getReactTypes(childContextTypes);

    constructor(props, context) {
      super(props, context);
      this.component = new Component(props, context, this);
      this.component.compute();
    }

    get state() {
      if (this.component) {
        const instance = this.component.getInstance();
        if (instance) {
          return instance.state;
        }
      }
      return null;
    }

    // eslint-disable-next-line no-unused-vars
    set state(nextState) {
      // Don't set state from the outside like this.
    }

    shouldComponentUpdate() {
      return false;
    }

    componentWillUnmount() {
      if (this.component) {
        this.component.componentWillUnmount();
        this.component.dispose();
        this.component = null;
      }
    }
  }

  provideReactFacade(ReactComponent);
  setClassName(ReactComponent, Class.name);
  Object.assign(ReactComponent, statics);
  return ReactComponent;
}
