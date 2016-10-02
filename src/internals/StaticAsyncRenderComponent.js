import { instanceOf, nullableOf } from '../types';
import StaticAsyncRenderContext from './StaticAsyncRenderContext';
import extendStatic from './extendStatic';

class StaticAsyncRenderComponent {
  static createClass(Component, schemaFactory) {
    return extendStatic(this, {
      ...schemaFactory(this),
      contextTypes: {
        ...StaticAsyncRenderComponent.contextTypes,
        ...Component.contextTypes,
      },
      childContextTypes: Component.childContextTypes,
      Component,
    });
  }

  static contextTypes = {
    __STATIC_RENDER: nullableOf(instanceOf(StaticAsyncRenderContext)),
  };

  constructor(props, context, delegate) {
    const { Component, contextSchema } = this.constructor;
    this.context = contextSchema.cast(context);
    if (this.context.__STATIC_RENDER) {
      this.component = this.context.__STATIC_RENDER.next(() =>
        new Component(props, context, delegate)
      );
    } else {
      this.component = new Component(props, context, delegate);
    }
  }

  instance() {
    return this.component.instance();
  }

  compute() {
    return this.component.compute();
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

  componentDidUpdate() {
    this.component.componentDidUpdate();
  }

  componentWillUnmount() {
    this.component.componentWillUnmount();
  }

  setState(nextState, callback) {
    this.component.setState(nextState, callback);
  }

  render() {
    return this.component.render();
  }
}

export default StaticAsyncRenderComponent;
