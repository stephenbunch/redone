import Dependency from './Dependency';

export default class Store {
  constructor(initialValue) {
    this._value = initialValue;
    this._dependency = new Dependency();
  }

  get() {
    this._dependency.depend();
    return this._value;
  }

  set(newValue) {
    if (newValue !== this._value) {
      this._value = newValue;
      this._dependency.changed();
    }
  }
}
