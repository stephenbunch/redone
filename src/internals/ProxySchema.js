import setClassName from './setClassName';
import ShapeSchema from '../schemas/ShapeSchema';
import toObject from '../utils/toObject';
import toJson from '../utils/toJson';

function defineMethod(Class, name, func) {
  Object.defineProperty(Class.prototype, name, {
    configurable: true,
    writable: true,
    value: func,
  });
}

export function createClass(name, proxyClassFactory) {
  class ProxySchema extends ShapeSchema {
    constructor(keys) {
      super(keys);
      this.Proxy = proxyClassFactory(keys);
      defineMethod(this.Proxy, 'toObject', function _() {
        return toObject(this, Object.keys(keys));
      });
      defineMethod(this.Proxy, 'toJSON', function _() {
        return toJson(this, Object.keys(keys));
      });
    }

    cast(value) {
      const { Proxy } = this;
      if (value === null || typeof value !== 'object') {
        value = {};
      }
      if (value instanceof Proxy) {
        return value;
      }
      return new Proxy(value);
    }
  }
  setClassName(ProxySchema, name);
  return ProxySchema;
}
