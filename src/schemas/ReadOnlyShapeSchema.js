import { createClass } from '../internals/ProxySchema';

export default createClass('ReadOnlyShapeSchema', keys => {
  class ReadOnlyShape {
    constructor(source) {
      Object.defineProperty(this, '__SOURCE', {
        value: source,
      });
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
});
