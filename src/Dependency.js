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
    const addBack = [];
    this.dependents = [];
    for (const computation of deps) {
      if (computation.isAlive) {
        if (Autorun.current === computation.autorun) {
          addBack.push(computation);
        } else {
          computation.autorun.rerun();
        }
      }
    }
    this.dependents = [...this.dependents, ...addBack];
  }
}
