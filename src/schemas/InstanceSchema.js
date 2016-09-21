import AnySchema from './AnySchema';

export default class InstanceSchema extends AnySchema {
  constructor(type) {
    super();
    if (typeof type !== 'function') {
      throw new Error('Type must be a class.');
    }
    this.type = type;
  }

  cast(value) {
    if (!(value instanceof this.type)) {
      throw new Error(`Value must be an instance of ${this.type.name}`);
    }
    return value;
  }
}
