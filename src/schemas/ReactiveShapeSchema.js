import Autorun from '../Autorun';
import KeyedDependency from '../KeyedDependency';
import ShapeSchema from './ShapeSchema';
import toObject from '../utils/toObject';
import toJson from '../utils/toJson';

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
        if (Autorun.current) {
          Autorun.current.computation.fork(() => {
            this[key] = source[key];
          });
        } else {
          this[key] = source[key];
        }
      });
      this.__INITIALIZED = true;
    }

    toObject() {
      return toObject(this, keys);
    }

    toJSON() {
      return toJson(this, keys);
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
