import Computation from './Computation';

export default class Dependency {
  constructor() {
    this.dependents = new Map();
  }

  depend() {
    if (Computation.current && Computation.current.isAlive) {
      this.dependents.set(Computation.current, Computation.current.ref);
    }
  }

  changed() {
    const dependents = this.dependents;
    this.dependents = new Map();
    for (const [computation, ref] of dependents.entries()) {
      if (Computation.current === computation) {
        this.dependents.set(computation, ref);
      } else if (computation.ref === ref) {
        computation.run();
      }
    }
  }
}
