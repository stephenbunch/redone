import Autorun from './Autorun';

export default class Dependency {
  constructor() {
    this.computations = [];
  }

  depend() {
    if (Autorun.current && Autorun.current.isAlive) {
      if (this.computations.indexOf(Autorun.current.computation) === -1) {
        this.computations.push(Autorun.current.computation);
      }
    }
  }

  changed() {
    const computations = this.computations;
    this.computations = [];
    for (const computation of computations) {
      if (computation.isAlive) {
        if (
          computation.autorun === Autorun.current ||
          computation.stack.indexOf(Autorun.current) > -1
        ) {
          throw new Error('Circular dependencies are not allowed.');
        }
        computation.autorun.rerun();
      }
    }
  }
}
