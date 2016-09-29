import Autorun from './Autorun';

export default class Dependency {
  constructor() {
    this.dependents = [];
  }

  depend() {
    if (Autorun.current && Autorun.current.isAlive) {
      if (this.dependents.indexOf(Autorun.current.computation) === -1) {
        this.dependents.push(Autorun.current.computation);
      }
    }
  }

  changed() {
    const deps = this.dependents;
    this.dependents = [];
    for (const computation of deps) {
      if (computation.isAlive) {
        if (computation.stack.indexOf(Autorun.current) > -1) {
          throw new Error('Circular dependencies are not allowed.');
        }
        computation.autorun.rerun();
      }
    }
  }
}
