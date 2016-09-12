let currentComputation = null;

function getComputeFunction(computation) {
  return function compute(func) {
    if (computation.isAlive) {
      const comp = new Computation(func, computation); // eslint-disable-line no-use-before-define
      return comp.run();
    }
    return func(compute, computation);
  };
}

export default class Computation {
  static get current() {
    return currentComputation;
  }

  static run(func) {
    const comp = new Computation(func);
    comp.run();
    return comp;
  }

  constructor(func, parent = null) {
    if (typeof func !== 'function') {
      throw new Error('The function argument must be a function.');
    }
    this.func = func;
    this.ref = null;
    this.parent = parent;
    this.parentRef = parent && parent.ref;
  }

  get isAlive() {
    return this.func !== null;
  }

  dispose() {
    this.func = null;
    this.ref = null;
    this.parent = null;
    this.parentRef = null;
  }

  run() {
    let result;
    if (this.parent && this.parent.ref !== this.parentRef) {
      this.dispose();
    } else if (this.func) {
      const current = currentComputation;
      currentComputation = this;
      this.ref = {};
      result = this.func(getComputeFunction(this), this);
      currentComputation = current;
    }
    return result;
  }
}
