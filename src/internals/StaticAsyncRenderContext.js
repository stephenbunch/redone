import StaticAsyncRenderState from './StaticAsyncRenderState';

export default class StaticAsyncRenderContext {
  constructor(delegate) {
    this.states = [];
    this.cursor = -1;
    this.pending = 0;
    this.delegate = delegate;
  }

  next() {
    this.cursor += 1;
    if (!this.states[this.cursor]) {
      this.states[this.cursor] = new StaticAsyncRenderState(this);
    }
    return this.states[this.cursor];
  }

  reset() {
    this.cursor = -1;
  }

  beginCompute() {
    this.pending += 1;
  }

  endCompute(err) {
    if (err) {
      this.delegate.didError(err);
    } else {
      this.pending -= 1;
      if (this.pending === 0) {
        // eslint-disable-next-line no-use-before-define
        this.delegate.didFinish();
      }
    }
  }
}
