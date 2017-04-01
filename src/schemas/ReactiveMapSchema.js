/* eslint no-underscore-dangle: "off" */

import AnySchema from './AnySchema';
import KeyedDependency from '../KeyedDependency';
import Autorun from '../Autorun';

class ReactiveMap {
  constructor(keySchema, valueSchema) {
    this._keySchema = keySchema;
    this._valueSchema = valueSchema;
    this._map = new Map();
    this._mapDependency = new KeyedDependency();
    this._keyDependency = new KeyedDependency();
  }

  get size() {
    this._mapDependency.depend('keys');
    return this._map.size;
  }

  has(key) {
    key = this._keySchema.cast(key);
    this._mapDependency.depend('keys');
    return this._map.has(key);
  }

  get(key) {
    key = this._keySchema.cast(key);
    this._keyDependency.depend(key);
    return this._map.get(key);
  }

  set(key, value) {
    key = this._keySchema.cast(key);
    value = this._valueSchema.cast(value);
    const isNew = !this._map.has(key);
    if (value !== this._map.get(key)) {
      this._map.set(key, value);
      Autorun.once(() => {
        this._keyDependency.changed(key);
        if (isNew) {
          this._mapDependency.changed('keys');
        }
        this._mapDependency.changed('values');
      });
    }
  }

  delete(key) {
    key = this._keySchema.cast(key);
    if (this._map.has(key)) {
      this._map.delete(key);
      Autorun.once(() => {
        this._keyDependency.changed(key);
        this._mapDependency.changed('keys');
        this._mapDependency.changed('values');
      });
    }
  }

  keys() {
    this._mapDependency.depend('keys');
    return this._map.keys();
  }

  values() {
    this._mapDependency.depend('values');
    return this._map.values();
  }

  entries() {
    this._mapDependency.depend('keys');
    this._mapDependency.depend('values');
    return this._map.entries();
  }

  [Symbol.iterator]() {
    this._mapDependency.depend('keys');
    this._mapDependency.depend('values');
    return this._map[Symbol.iterator]();
  }
}

export default class ReactiveMapSchema extends AnySchema {
  constructor(keySchema, valueSchema) {
    super();
    this.keySchema = keySchema;
    this.valueSchema = valueSchema;
  }

  cast(value) {
    if (value instanceof ReactiveMap) {
      if (value._keySchema === this.keySchema && value._valueSchema === this.valueSchema) {
        return value;
      }
      value = value._map;
    }
    const map = new ReactiveMap(this.keySchema, this.valueSchema);
    if (value instanceof Map) {
      for (const [key, val] of value) {
        map.set(key, val);
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        map.set(key, value[key]);
      }
    }
    return map;
  }

  transform(transform) {
    return new this.constructor(transform(this.keySchema), transform(this.valueSchema));
  }
}
