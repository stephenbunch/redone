/* eslint-disable no-underscore-dangle */

import MultiPassRenderContext from './MultiPassRenderContext';

class MultiPassComponent {
  constructor(Component, props, delegate) {
    if (MultiPassRenderContext.current) {
      this._component = MultiPassRenderContext.current.provide(() =>
        new Component(props, delegate)
      );
    } else {
      this._component = new Component(props, delegate);
    }
  }

  instance() {
    return this._component.instance();
  }

  compute() {
    return this._component.compute();
  }

  componentWillMount() {
    this._component.componentWillMount();
  }

  componentDidMount() {
    this._component.componentDidMount();
  }

  componentWillReceiveProps(nextProps) {
    this._component.componentWillReceiveProps(nextProps);
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

  dispose() {
    this._component.dispose();
  }
}

export function createProxy(Component) {
  return class extends MultiPassComponent {
    constructor(props, delegate) {
      super(Component, props, delegate);
    }
  };
}
