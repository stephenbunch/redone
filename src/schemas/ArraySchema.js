import AnySchema from './AnySchema';

export default class ArraySchema extends AnySchema {
  constructor(item) {
    super();
    this.item = item;
  }

  cast(value) {
    if (Array.isArray(value)) {
      return value.map(item => this.item.cast(item));
    }
    return [];
  }

  transform(transform) {
    return new this.constructor(transform(this.item));
  }
}
