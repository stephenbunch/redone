import LambdaComponent from './LambdaComponent';

let current = null;

export default class MultiPassRenderContext {
  static get current() {
    return current;
  }

  constructor(delegate) {
    this._states = [];
    this._cursor = -1;
    this._pending = 0;
    this._delegate = delegate;
    this._isAlive = true;
  }

  get pending() {
    return this._pending > 0;
  }

  get isAlive() {
    return this._isAlive;
  }

  render(func) {
    const temp = current;
    try {
      current = this;
      return func();
    } finally {
      current = temp;
    }
  }

  provide(componentFactory) {
    this._cursor += 1;
    if (!this._states[this._cursor]) {
      this._states[this._cursor] = new LambdaComponent(this, componentFactory);
    }
    return this._states[this._cursor];
  }

  reset() {
    this._cursor = -1;
  }

  beginTask() {
    this._pending += 1;
  }

  endTask() {
    this._pending -= 1;
    if (this._pending === 0) {
      this._delegate.next();
    }
  }

  taskError(err) {
    this._isAlive = false;
    this._delegate.onError(err);
  }
}
