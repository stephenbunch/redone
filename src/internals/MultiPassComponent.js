import { instanceOf, nullableOf } from '../types';
import MultiPassRenderContext from './MultiPassRenderContext';

export function createProxy(Component) {
  const contextTypes = {
    __MULTI_PASS_RENDER_CONTEXT: nullableOf(instanceOf(MultiPassRenderContext)),
  };

  class MultiPassComponent {
    constructor(props, context, delegate) {
      if (context.__MULTI_PASS_RENDER_CONTEXT) {
        this.component = context.__MULTI_PASS_RENDER_CONTEXT.provide(() =>
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

  return {
    contextTypes,
    Component: MultiPassComponent,
  };
}
