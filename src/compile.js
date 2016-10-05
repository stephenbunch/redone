import React from 'react';

import getReactTypes from './utils/getReactTypes';
import setClassName from './internals/setClassName';
import createProxy from './internals/createProxy';

const hot = {};

function createClass(proxy, name, statics, moduleId) {
  const { contextTypes, childContextTypes, Component } = proxy;

  class ReactComponent extends React.Component {
    static contextTypes = contextTypes && getReactTypes(contextTypes);
    static childContextTypes = childContextTypes && getReactTypes(childContextTypes);

    constructor(props, context) {
      super(props, context);
      if (hot[moduleId]) {
        hot[moduleId].instances.push(this);
      }
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
      if (hot[moduleId]) {
        hot[moduleId].instances.splice(hot[moduleId].instances.indexOf(this), 1);
      }
    }

    setState(nextState, callback) {
      this.component.setState(nextState, callback);
    }

    update(Component) {
      this.component.componentWillUnmount();
      this.component.dispose();
      this.component = new Component(this.props, this.context, this);
      this.component.compute();
      this.forceUpdate();
    }

    render() {
      return this.component.render();
    }
  }

  setClassName(ReactComponent, name);
  Object.assign(ReactComponent, statics);
  return ReactComponent;
}

export default function compile(Class, schemaFactory, module) {
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

  if (module && module.hot) {
    module.hot.accept();
    if (!hot[module.id]) {
      hot[module.id] = {
        Class: createClass(proxy, Class.name, statics, module.id),
        instances: [],
      };
    } else {
      Object.assign(hot[module.id].Class, {
        contextTypes: proxy.contextTypes,
        childContextTypes: proxy.childContextTypes,
      }, statics);
      hot[module.id].instances.forEach(x => x.update(proxy.Component));
    }
    return hot[module.id].Class;
  }
  return createClass(proxy, Class.name, statics);
}
