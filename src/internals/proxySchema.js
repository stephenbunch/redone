import setClassName from './setClassName';
import ShapeSchema from '../schemas/ShapeSchema';
import provideMethod from './provideMethod';
import toObject from '../utils/toObject';
import toJson from '../utils/toJson';

export default function createProxySchema(name, classFactory) {
  class ProxySchema extends ShapeSchema {
    constructor(keys) {
      super(keys);
      this.proxyClass = classFactory(keys);
      provideMethod(this.proxyClass, 'toObject', function _() {
        return toObject(this, Object.keys(keys));
      });
      provideMethod(this.proxyClass, 'toJSON', function _() {
        return toJson(this, Object.keys(keys));
      });
    }

    cast(value) {
      if (value === null || typeof value !== 'object') {
        value = {};
      }
      if (value instanceof this.proxyClass) {
        return value;
      }
      // eslint-disable-next-line new-cap
      return new this.proxyClass(value);
    }
  }
  setClassName(ProxySchema, name);
  return ProxySchema;
}
