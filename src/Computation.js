import Autorun from './Autorun';

export default class Computation {
  constructor(autorun, isFirstRun) {
    this.autorun = autorun;
    this.isFirstRun = isFirstRun;
  }

  get isAlive() {
    return this.autorun !== null;
  }

  continue(func) {
    if (this.autorun) {
      return this.autorun.exec(func);
    }
    return undefined;
  }

  fork(func) {
    if (this.autorun) {
      const autorun = new Autorun(func, this);
      return autorun.rerun();
    }
    return undefined;
  }

  dispose() {
    this.autorun = null;
  }
}
