function nullIfUndefined(value) {
  if (value === undefined) {
    return null;
  }
  return value;
}

export default class StaticAsyncRenderState {
  constructor(context) {
    this.context = context;
    this.computeResult = undefined;
    this.childContext = undefined;
    this.renderResult = undefined;
    this.computeFinished = false;
    this.component = undefined;
  }

  hasRenderResult() {
    return this.renderResult !== undefined;
  }

  hasChildContext() {
    return this.childContext !== undefined;
  }

  hasComputeResult() {
    return this.computeResult !== undefined;
  }

  hasComponent() {
    return this.component !== undefined;
  }

  setComponent(component) {
    if (this.hasComponent()) {
      throw new Error('Component has already been set.');
    }
    this.component = nullIfUndefined(component);
  }

  setComputeResult(result) {
    if (this.hasComputeResult()) {
      throw new Error('Compute result has already been set.');
    }
    if (result && typeof result.then === 'function') {
      this.context.beginCompute();
      result = result.then(
        () => {
          this.computeFinished = true;
          this.context.endCompute();
        },
        err => this.context.endCompute(err)
      );
    } else {
      this.computeFinished = true;
    }
    this.computeResult = nullIfUndefined(result);
  }

  setChildContext(childContext) {
    if (this.hasChildContext()) {
      throw new Error('Child context has already been set.');
    }
    this.childContext = nullIfUndefined(childContext);
  }

  setRenderResult(element) {
    if (this.hasRenderResult()) {
      throw new Error('Render result has already been set.');
    }
    this.renderResult = nullIfUndefined(element);
  }

  getComponent() {
    return this.component;
  }

  getComputeResult() {
    return this.computeResult;
  }

  getChildContext() {
    return this.childContext;
  }

  getRenderResult() {
    return this.renderResult;
  }
}
