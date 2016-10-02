import LambdaComponent from './LambdaComponent';

export default class MultiPassRenderContext {
  constructor(delegate) {
    this.states = [];
    this.cursor = -1;
    this.pending = 0;
    this.delegate = delegate;
    this.isAlive = true;
  }

  provide(componentFactory) {
    this.cursor += 1;
    if (!this.states[this.cursor]) {
      this.states[this.cursor] = new LambdaComponent(this, componentFactory);
    }
    return this.states[this.cursor];
  }

  reset() {
    this.cursor = -1;
  }

  beginTask() {
    this.pending += 1;
  }

  endTask() {
    this.pending -= 1;
    if (this.pending === 0) {
      this.delegate.next();
    }
  }

  throwError(err) {
    this.isAlive = false;
    this.delegate.onError(err);
  }
}
