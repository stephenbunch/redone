import Computation from './Computation';

let currentAutorun = null;

export default class Autorun {
  static get current() {
    return currentAutorun;
  }

  static start(func) {
    const autorun = new Autorun(func);
    autorun.rerun();
    return autorun;
  }

  constructor(func, parentComputation = null) {
    if (typeof func !== 'function') {
      throw new Error('The function argument must be a function.');
    }
    this.func = func;
    this.computation = null;
    this.parentComputation = parentComputation;
    this.value = null;
  }

  get isAlive() {
    return this.func !== null;
  }

  dispose() {
    this.func = null;
    this.computation.dispose();
    this.computation = null;
    this.parentComputation = null;
  }

  rerun() {
    let result;
    if (this.func) {
      if (this.parentComputation && !this.parentComputation.isAlive) {
        this.dispose();
      } else {
        result = this.exec(() => {
          const isFirstRun = this.computation === null;
          if (this.computation) {
            this.computation.dispose();
          }
          this.computation = new Computation(this, isFirstRun);
          this.value = this.func(this.computation);
          return this.value;
        });
      }
    }
    return result;
  }

  exec(func) {
    const current = currentAutorun;
    currentAutorun = this;
    const result = func();
    currentAutorun = current;
    return result;
  }
}
