import StaticComponent from './StaticComponent';

export default class StaticAsyncRenderContext {
  constructor(delegate) {
    this.states = [];
    this.cursor = -1;
    this.pending = 0;
    this.delegate = delegate;
    this.isAlive = true;
  }

  next(componentFactory) {
    this.cursor += 1;
    if (!this.states[this.cursor]) {
      this.states[this.cursor] = new StaticComponent(this, componentFactory);
    }
    return this.states[this.cursor];
  }

  reset() {
    this.cursor = -1;
  }

  startCompute() {
    this.pending += 1;
  }

  throwError(err) {
    this.isAlive = false;
    this.delegate.didError(err);
  }

  finishCompute() {
    this.pending -= 1;
    if (this.pending === 0) {
      this.delegate.didFinish();
    }
  }
}
