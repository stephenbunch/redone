import React from 'react';

import { reactiveShape } from './Types';
import getReactTypes from './getReactTypes';
import Autorun from './Autorun';

function isFunc(prop) {
  return typeof prop === 'function';
}

function setState(state) {
  Autorun.suspend();
  Object.assign(this.state, state);
  Autorun.resume();
}

export default function connect(Component) {
  const { propTypes, stateTypes, contextTypes, childContextTypes, ...statics } = Component;
  const propsSchema = propTypes && reactiveShape(propTypes);
  const stateSchema = stateTypes && reactiveShape(stateTypes);
  const contextSchema = contextTypes && reactiveShape(contextTypes);

  class ReactiveComponent extends React.Component {
    static contextTypes = contextTypes && getReactTypes(contextTypes);
    static childContextTypes = childContextTypes && getReactTypes(childContextTypes);

    constructor(props, context) {
      super(props, context);

      this.component = Object.create(Component.prototype);
      Object.defineProperty(this.component, 'props', { value: propsSchema ? propsSchema.cast(props) : null });
      Object.defineProperty(this.component, 'context', { value: contextSchema ? contextSchema.cast(context) : null });
      Object.defineProperty(this.component, 'state', { value: stateSchema ? stateSchema.cast() : null });
      Object.defineProperty(this.component, 'setState', { value: setState });
      Object.defineProperty(this.component, 'suspend', { value: ::Autorun.suspend });
      Object.defineProperty(this.component, 'resume', { value: ::Autorun.resume });
      Component.call(this.component, this.component.props, this.component.context);

      this.renderAutorun = null;
      this.element = null;
      this.childContextAutorun = null;
      this.childContext = null;

      if (isFunc(this.component.compute)) {
        this.computeAutorun = Autorun.start(comp => {
          this.component.compute(comp);
        });
      } else {
        this.computeAutorun = null;
      }
    }

    getChildContext() {
      if (isFunc(this.component.getChildContext)) {
        this.childContextAutorun = Autorun.start(comp => {
          this.childContext = this.component.getChildContext();
          if (!comp.isFirstRun) {
            Autorun.never(() => {
              this.forceUpdate();
            });
          }
        });
      }
      return this.childContext;
    }

    componentWillMount() {
      if (isFunc(this.component.componentWillMount)) {
        this.component.componentWillMount();
      }
    }

    componentDidMount() {
      if (isFunc(this.component.componentDidMount)) {
        this.component.componentDidMount();
      }
    }

    componentWillReceiveProps(nextProps, nextContext) {
      Autorun.suspend();
      if (this.component.props) {
        Object.assign(this.component.props, nextProps);
      }
      if (this.component.context) {
        Object.assign(this.component.context, nextContext);
      }
      Autorun.resume();
    }

    componentDidUpdate() {
      if (isFunc(this.component.componentDidUpdate)) {
        this.component.componentDidUpdate();
      }
    }

    componentWillUnmount() {
      if (this.renderAutorun) {
        this.renderAutorun.dispose();
        this.renderAutorun = null;
      }
      if (this.computeAutorun) {
        this.computeAutorun.dispose();
        this.computeAutorun = null;
      }
      if (this.childContextAutorun) {
        this.childContextAutorun.dispose();
        this.childContextAutorun = null;
      }
      this.element = null;
      if (isFunc(this.component.componentWillUnmount)) {
        this.component.componentWillUnmount();
      }
      this.component = null;
    }

    render() {
      if (isFunc(this.component.render)) {
        if (this.renderAutorun === null) {
          this.renderAutorun = Autorun.start(comp => {
            this.element = this.component.render();
            if (!comp.isFirstRun) {
              Autorun.never(() => {
                this.forceUpdate();
              });
            }
          });
        }
      }
      return this.element;
    }
  }

  Object.defineProperty(ReactiveComponent, 'name', {
    value: Component.name,
  });
  Object.assign(ReactiveComponent, statics);
  return ReactiveComponent;
}
