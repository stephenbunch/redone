import ShapeSchema from './ShapeSchema';
import toObject from '../utils/toObject';
import toJson from '../utils/toJson';

function createClass(keys) {
  class ReadOnlyShape {
    constructor(source) {
      Object.defineProperty(this, '__SOURCE', {
        value: source,
      });
    }

    toObject() {
      return toObject(this, Object.keys(keys));
    }

    toJSON() {
      return toJson(this, Object.keys(keys));
    }
  }

  Object.keys(keys).forEach(key => {
    Object.defineProperty(ReadOnlyShape.prototype, key, {
      get() {
        return keys[key].cast(this.__SOURCE[key]);
      },
    });
  });
  return ReadOnlyShape;
}

export default class ReadOnlyShapeSchema extends ShapeSchema {
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
