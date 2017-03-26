function nullIfUndefined(value) {
  if (value === undefined) {
    return null;
  }
  return value;
}

export default class LambdaComponent {
  constructor(context, componentFactory) {
    this._context = context;
    this._computeResult = undefined;
    this._renderResult = undefined;
    this._computeFinished = false;
    this._component = componentFactory();
  }

  instance() {
    if (this._component) {
      return this._component.instance();
    }
    return null;
  }

  compute() {
    if (this._computeResult === undefined) {
      let result;
      try {
        result = this._component.compute();
      } catch (err) {
        this.dispose();
        throw err;
      }
      if (result && typeof result.then === 'function') {
        this._context.beginTask();
        result = result.then(
          () => {
            if (this._context.isAlive) {
              this._computeFinished = true;
              this._context.endTask();
              this._context = null;
            } else {
              this.dispose();
            }
          },
          err => {
            this.dispose();
            this._context.taskError(err);
            this._context = null;
          }
        );
      } else {
        this._computeFinished = true;
      }
      this._computeResult = nullIfUndefined(result);
    }
    return this._computeResult;
  }

  render() {
    if (this._computeFinished) {
      if (this._renderResult === undefined) {
        let result;
        try {
          result = this._component.render();
        } catch (err) {
          this.dispose();
          throw err;
        }
        this._renderResult = nullIfUndefined(result);
      }
      return this._renderResult;
    }
    return null;
  }

  componentWillMount() {
    if (this._component) {
      try {
        this._component.componentWillMount();
      } catch (err) {
        this.dispose();
        throw err;
      }
    }
  }

  dispose() {
    this._component.dispose();
    this._component = null;
  }
}
