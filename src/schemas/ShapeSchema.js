import AnySchema from './AnySchema';

export default class ShapeSchema extends AnySchema {
  constructor(keys) {
    super();
    this.keys = keys;
  }

  cast(value) {
    const retval = {};
    if (typeof value !== 'object' || value === null) {
      value = {};
    }
    for (const key of Object.keys(this.keys)) {
      const val = this.keys[key].cast(value[key]);
      if (val !== undefined) {
        retval[key] = val;
      }
    }
    return retval;
  }

  transform(transform) {
    const keys = {};
    for (const key of Object.keys(this.keys)) {
      if (typeof this.keys[key].transform === 'function') {
        keys[key] = transform(this.keys[key].transform(transform));
      } else {
        keys[key] = transform(this.keys[key]);
      }
    }
    return new this.constructor(keys);
  }
}
