import AnySchema from './AnySchema';

export default class OptionalSchema extends AnySchema {
  constructor(schema) {
    super();
    this.schema = schema;
  }

  cast(value) {
    if (value === undefined) {
      return undefined;
    }
    return this.schema.cast(value);
  }

  transform(transform) {
    return new this.constructor(transform(this.schema));
  }
}
