import AnySchema from './AnySchema';

export default class NullableSchema extends AnySchema {
  constructor(schema) {
    super();
    this.schema = schema;
  }

  cast(value) {
    if (value === null) {
      return null;
    }
    return this.schema.cast(value);
  }

  transform(transform) {
    return new this.constructor(transform(this.schema));
  }
}
