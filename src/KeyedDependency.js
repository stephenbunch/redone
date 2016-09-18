import Dependency from './Dependency';

export default class KeyedDependency {
  constructor() {
    this.dependents = {};
  }

  depend(key) {
    if (!this.dependents[key]) {
      this.dependents[key] = new Dependency();
    }
    this.dependents[key].depend();
  }

  changed(key) {
    if (this.dependents[key]) {
      this.dependents[key].changed();
    }
  }
}
