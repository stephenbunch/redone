import Dependency from './Dependency';

export default class KeyedDependency {
  constructor() {
    this.dependencies = {};
  }

  depend(key) {
    if (!this.dependencies[key]) {
      this.dependencies[key] = new Dependency();
    }
    this.dependencies[key].depend();
  }

  changed(key) {
    if (this.dependencies[key]) {
      this.dependencies[key].changed();
    }
  }
}
