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
    let item = this.item;
    if (typeof item.transform === 'function') {
      item = item.transform(transform);
    }
    item = transform(item);
    return new ArraySchema(item);
  }
}
