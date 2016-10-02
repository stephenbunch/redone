function nullIfUndefined(value) {
  if (value === undefined) {
    return null;
  }
  return value;
}

export default class LambdaComponent {
  constructor(context, componentFactory) {
    this.context = context;
    this.computeResult = undefined;
    this.childContext = undefined;
    this.renderResult = undefined;
    this.computeFinished = false;
    this.component = componentFactory();
  }

  instance() {
    if (this.component) {
      return this.component.instance();
    }
    return null;
  }

  compute() {
    if (this.computeResult === undefined) {
      let result;
      try {
        result = this.component.compute();
      } catch (err) {
        this.dispose();
        throw err;
      }
      if (result && typeof result.then === 'function') {
        this.context.beginTask();
        result = result.then(
          () => {
            if (this.context.isAlive) {
              this.computeFinished = true;
              this.context.endTask();
              this.context = null;
            } else {
              this.dispose();
            }
          },
          err => {
            this.dispose();
            this.context.throwError(err);
            this.context = null;
          }
        );
      } else {
        this.computeFinished = true;
      }
      this.computeResult = nullIfUndefined(result);
    }
    return this.computeResult;
  }

  getChildContext() {
    if (this.computeFinished) {
      if (this.childContext === undefined) {
        let result;
        try {
          result = this.component.getChildContext();
        } catch (err) {
          this.dispose();
          throw err;
        }
        this.childContext = nullIfUndefined(result);
        this.dispose();
      }
      return this.childContext;
    }
    return null;
  }

  render() {
    if (this.computeFinished) {
      if (this.renderResult === undefined) {
        let result;
        try {
          result = this.component.render();
        } catch (err) {
          this.dispose();
          throw err;
        }
        this.renderResult = nullIfUndefined(result);
      }
      return this.renderResult;
    }
    return null;
  }

  componentWillMount() {
    if (this.component) {
      try {
        this.component.componentWillMount();
      } catch (err) {
        this.dispose();
        throw err;
      }
    }
  }

  dispose() {
    this.component.dispose();
    this.component = null;
  }
}
