import provideFacade from './provideFacade';
import { func, instanceOf, nullableOf } from '../types';
import StaticAsyncRenderContext from './StaticAsyncRenderContext';
import extendClass from './extendClass';

class StaticAsyncRenderComponent {
  static contextTypes = {
    __COMPUTE_BEGIN: nullableOf(func),
    __COMPUTE_END: nullableOf(func),
    __STATIC_RENDER: nullableOf(instanceOf(StaticAsyncRenderContext)),
  };

  constructor(props, context, delegate) {
    const { Component, contextSchema } = this.constructor;
    this.context = contextSchema.cast(context);
    if (this.context.__STATIC_RENDER) {
      this.container = this.context.__STATIC_RENDER.next();
      if (!this.container.hasComponent()) {
        this.container.setComponent(new Component(props, context, delegate));
      }
      this.component = this.container.getComponent();
    } else {
      this.component = new Component(props, context, delegate);
    }
  }

  compute() {
    if (this.container) {
      if (!this.container.hasComputeResult()) {
        this.container.setComputeResult(this.component.compute());
      }
      return this.container.getComputeResult();
    }
    return this.component.compute();
  }

  getChildContext() {
    if (this.container) {
      if (this.container.computeFinished === false) {
        return null;
      }
      if (!this.container.hasChildContext()) {
        this.container.setChildContext(this.component.getChildContext());
        this.component.dispose();
        this.component = null;
        this.container.component = null;
      }
      return this.container.getChildContext();
    }
    return this.component.getChildContext();
  }

  render() {
    if (this.container) {
      if (this.container.computeFinished === false) {
        return null;
      }
      if (!this.container.hasRenderResult()) {
        this.container.setRenderResult(this.component.render());
      }
      return this.container.getRenderResult();
    }
    return this.component.render();
  }
}

provideFacade(StaticAsyncRenderComponent);

export default function staticAsyncRenderComponentClass(Component, schemaFactory) {
  return extendClass(StaticAsyncRenderComponent, {
    ...schemaFactory(StaticAsyncRenderComponent),
    contextTypes: {
      ...StaticAsyncRenderComponent.contextTypes,
      ...Component.contextTypes,
    },
    childContextTypes: Component.childContextTypes,
    Component,
  });
}
