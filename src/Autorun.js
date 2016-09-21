import Computation from './Computation';

let currentAutorun = null;
let suspendCount = 0;
let suspendedAutoruns = [];

export default class Autorun {
  static get current() {
    return currentAutorun;
  }

  static start(func) {
    const autorun = new Autorun(func);
    autorun.rerun();
    return autorun;
  }

  static suspend() {
    suspendCount += 1;
  }

  static resume() {
    if (suspendCount > 0) {
      suspendCount -= 1;
      if (suspendCount === 0) {
        const autoruns = suspendedAutoruns;
        suspendedAutoruns = [];
        for (const autorun of autoruns) {
          autorun.rerun();
        }
      }
    }
  }

  static never(func) {
    const current = currentAutorun;
    currentAutorun = null;
    const result = func();
    currentAutorun = current;
    return result;
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
      } else if (suspendCount > 0) {
        suspendedAutoruns.push(this);
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
