import React from 'react';

import Autorun from './Autorun';
import SchemaParser from './SchemaParser';
import { ReactiveShapeSchema, ReadOnlyShapeSchema } from './schemas';
import getReactTypes from './utils/getReactTypes';
import transformReplaceShape from './utils/transformReplaceShape';

const defaultParser = new SchemaParser();

function isFunc(prop) {
  return typeof prop === 'function';
}

function setState(state) {
  Autorun.suspend();
  Object.assign(this.state, state);
  Autorun.resume();
}

export default function connect(Component, parser = defaultParser) {
  if (typeof Component !== 'function') {
    throw new Error('Component must be a class.');
  }
  if (Component.prototype instanceof React.Component) {
    throw new Error('Component should not inherit from React.Component.');
  }

  const { propTypes, stateTypes, contextTypes, childContextTypes, ...statics } = Component;
  const propsShape = propTypes && parser.parseShape(propTypes);
  const stateShape = stateTypes && parser.parseShape(stateTypes);
  const contextShape = contextTypes && parser.parseShape(contextTypes);

  const propsSchema = propsShape && transformReplaceShape(propsShape, ReactiveShapeSchema);
  const stateSchema = stateShape && transformReplaceShape(stateShape, ReactiveShapeSchema);
  const contextSchema = contextShape && transformReplaceShape(contextShape, ReactiveShapeSchema);

  const readOnlyPropsSchema = propsShape && transformReplaceShape(propsShape, ReadOnlyShapeSchema);
  const readOnlyContextSchema = contextShape && transformReplaceShape(contextShape, ReadOnlyShapeSchema);

  class ReactiveComponent extends React.Component {
    static contextTypes = contextTypes && getReactTypes(contextTypes);
    static childContextTypes = childContextTypes && getReactTypes(childContextTypes);

    constructor(props, context) {
      super(props, context);

      this.componentProps = propsSchema ? propsSchema.cast(props) : null;
      this.componentContext = contextSchema ? contextSchema.cast(context) : null;

      this.component = Object.create(Component.prototype);
      Object.defineProperty(this.component, 'props', { value: propsSchema ? readOnlyPropsSchema.cast(this.componentProps) : null });
      Object.defineProperty(this.component, 'context', { value: contextSchema ? readOnlyContextSchema.cast(this.componentContext) : null });
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
      if (this.componentProps) {
        Object.assign(this.componentProps, nextProps);
      }
      if (this.componentContext) {
        Object.assign(this.componentContext, nextContext);
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

    setState(state) {
      this.component.setState(state);
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
