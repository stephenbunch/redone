import Computation from './Computation';

export default class Dependency {
  constructor() {
    this.dependents = [];
  }

  depend() {
    if (Computation.current && Computation.current.isAlive) {
      if (this.dependents.indexOf(Computation.current.ref) === -1) {
        this.dependents.push(Computation.current.ref);
      }
    }
  }

  changed() {
    const deps = this.dependents;
    const addBack = [];
    this.dependents = [];
    for (const computationRef of deps) {
      if (computationRef.value !== null) {
        if (Computation.current === computationRef.value) {
          addBack.push(computationRef);
        } else {
          computationRef.value.run();
        }
      }
    }
    this.dependents = [...this.dependents, ...addBack];
  }
}
