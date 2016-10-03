/* eslint-disable no-underscore-dangle */

import { instanceOf, nullableOf } from '../types';
import MultiPassRenderContext from './MultiPassRenderContext';

export function createProxy(Component) {
  const contextTypes = {
    __MULTI_PASS_RENDER_CONTEXT: nullableOf(instanceOf(MultiPassRenderContext)),
  };

  class MultiPassComponent {
    constructor(props, context, delegate) {
      if (context.__MULTI_PASS_RENDER_CONTEXT) {
        this._component = context.__MULTI_PASS_RENDER_CONTEXT.provide(() =>
          new Component(props, context, delegate)
        );
      } else {
        this._component = new Component(props, context, delegate);
      }
    }

    instance() {
      return this._component.instance();
    }

    compute() {
      return this._component.compute();
    }

    getChildContext() {
      return this._component.getChildContext();
    }

    componentWillMount() {
      this._component.componentWillMount();
    }

    componentDidMount() {
      this._component.componentDidMount();
    }

    componentWillReceiveProps(nextProps, nextContext) {
      this._component.componentWillReceiveProps(nextProps, nextContext);
    }

    componentDidUpdate() {
      this._component.componentDidUpdate();
    }

    componentWillUnmount() {
      this._component.componentWillUnmount();
    }

    setState(nextState, callback) {
      this._component.setState(nextState, callback);
    }

    render() {
      return this._component.render();
    }
  }

  return {
    contextTypes,
    Component: MultiPassComponent,
  };
}
