import React from 'react';

import getReactTypes from './utils/getReactTypes';
import setClassName from './internals/setClassName';
import createProxy from './internals/createProxy';
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

  const proxy = createProxy(Class, schemaFactory);
  const { contextTypes, childContextTypes, Component } = proxy;

  class ReactComponent extends React.Component {
    static contextTypes = contextTypes && getReactTypes(contextTypes);
    static childContextTypes = childContextTypes && getReactTypes(childContextTypes);

    constructor(props, context) {
      super(props, context);
      this.component = new Component(props, context, this);
      this.component.compute();
    }

    get state() {
      const instance = this.component.instance();
      if (instance) {
        return instance.state;
      }
      return null;
    }

    set state(nextState) {
      const instance = this.component.instance();
      if (instance) {
        instance.state = nextState;
      }
    }

    getChildContext() {
      return this.component.getChildContext();
    }

    componentWillMount() {
      this.component.componentWillMount();
    }

    componentDidMount() {
      this.component.componentDidMount();
    }

    componentWillReceiveProps(nextProps, nextContext) {
      this.component.componentWillReceiveProps(nextProps, nextContext);
    }

    shouldComponentUpdate() {
      return false;
    }

    componentDidUpdate() {
      this.component.componentDidUpdate();
    }

    componentWillUnmount() {
      this.component.componentWillUnmount();
      this.component.dispose();
    }

    setState(nextState, callback) {
      this.component.setState(nextState, callback);
    }

    render() {
      return this.component.render();
    }
  }

  setClassName(ReactComponent, Class.name);
  Object.assign(ReactComponent, statics);
  return ReactComponent;
}
