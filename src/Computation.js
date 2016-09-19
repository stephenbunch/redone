let currentComputation = null;

export default class Computation {
  static get current() {
    return currentComputation;
  }

  static start(func) {
    const comp = new Computation(func);
    comp.run();
    return comp;
  }

  constructor(func, parentRef = null) {
    if (typeof func !== 'function') {
      throw new Error('The function argument must be a function.');
    }
    this.func = func;
    this.ref = null;
    this.parentRef = parentRef;
    this.value = null;
  }

  get isAlive() {
    return this.func !== null;
  }

  dispose() {
    this.func = null;
    this.ref.value = null;
    this.ref = null;
    this.parentRef = null;
  }

  fork(func) {
    if (this.isAlive) {
      const comp = new Computation(func, this.ref);
      return comp.run();
    }
    return func(this);
  }

  run() {
    let result;
    if (this.parentRef && this.parentRef.value === null) {
      this.dispose();
    } else if (this.func) {
      const current = currentComputation;
      currentComputation = this;
      if (this.ref) {
        this.ref.value = null;
      }
      this.ref = { value: this };
      result = this.func(this);
      this.value = result;
      currentComputation = current;
    }
    return result;
  }
}
