import Computation from './Computation';

let currentAutorun = null;
let suspendCount = 0;
let suspendedAutoruns = [];
const autorunStack = [];
let uid = 0;

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

  static exclude(func) {
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
    this.id = ++uid;
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
    if (this.computation) {
      this.computation.dispose();
      this.computation = null;
    }
    this.parentComputation = null;
  }

  rerun() {
    let result;
    if (this.func) {
      if (this.parentComputation && !this.parentComputation.isAlive) {
        this.dispose();
      } else if (suspendCount > 0) {
        if (suspendedAutoruns.indexOf(this) === -1) {
          suspendedAutoruns.push(this);
        }
      } else {
        result = this.exec(() => {
          const isFirstRun = this.computation === null;
          if (this.computation) {
            this.computation.dispose();
          }
          this.computation = new Computation(this, isFirstRun, autorunStack.slice());
          try {
            this.value = this.func(this.computation);
          } catch (err) {
            this.dispose();
            throw err;
          }
          return this.value;
        });
      }
    }
    return result;
  }

  exec(func) {
    if (currentAutorun) {
      autorunStack.push(currentAutorun);
    }
    const current = currentAutorun;
    currentAutorun = this;
    try {
      return func();
    } finally {
      currentAutorun = current;
      if (currentAutorun) {
        autorunStack.pop();
      }
    }
  }
}
