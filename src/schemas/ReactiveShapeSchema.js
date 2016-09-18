import Computation from '../Computation';
import KeyedDependency from '../KeyedDependency';
import ShapeSchema from './ShapeSchema';

function createClass(keys) {
  class ReactiveShape {
    constructor(source) {
      Object.defineProperty(this, '__DEPENDENCY', {
        value: new KeyedDependency(),
      });
      Object.defineProperty(this, '__INITIALIZED', {
        value: false,
        writable: true,
      });
      Object.defineProperty(this, '__VALUES', {
        value: new Map(),
      });
      Object.keys(keys).forEach(key => {
        if (Computation.current) {
          Computation.current.fork(() => {
            this[key] = source[key];
          });
        } else {
          this[key] = source[key];
        }
      });
      this.__INITIALIZED = true;
    }

    get __TYPE() {
      return this.constructor;
    }

    toObject() {
      const retval = {};
      for (const key of Object.keys(keys)) {
        let value = this[key];
        if (
          typeof value === 'object' &&
          value !== null &&
          typeof value.toObject === 'function'
        ) {
          value = value.toObject();
        }
        if (value !== undefined) {
          retval[key] = value;
        }
      }
      return retval;
    }

    toJSON() {
      const retval = {};
      for (const key of Object.keys(keys)) {
        let value = this[key];
        if (typeof value === 'object' && value !== null) {
          if (typeof value.toJSON === 'function') {
            value = value.toJSON();
          } else if (typeof value.toObject === 'function') {
            value = value.toObject();
          }
        }
        if (value !== undefined) {
          retval[key] = value;
        }
      }
      return retval;
    }
  }

  Object.keys(keys).forEach(key => {
    Object.defineProperty(ReactiveShape.prototype, key, {
      get() {
        this.__DEPENDENCY.depend(key);
        return this.__VALUES.get(key);
      },
      set(value) {
        value = keys[key].cast(value);
        if (value !== this.__VALUES.get(key)) {
          this.__VALUES.set(key, value);
          if (this.__INITIALIZED) {
            this.__DEPENDENCY.changed(key);
          }
        }
      },
    });
  });
  return ReactiveShape;
}

export default class ReactiveShapeSchema extends ShapeSchema {
  constructor(keys) {
    super(keys);
    this.shapeClass = createClass(keys);
  }

  cast(value) {
    if (value === null || typeof value !== 'object') {
      value = {};
    }
    if (value instanceof this.shapeClass) {
      return value;
    }
    // eslint-disable-next-line new-cap
    return new this.shapeClass(value);
  }
}
