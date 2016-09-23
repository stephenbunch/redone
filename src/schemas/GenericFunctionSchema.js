import AnySchema from './AnySchema';

export default class GenericFunctionSchema extends AnySchema {
  constructor(schema) {
    super();
    this.out = schema;
  }

  cast(value) {
    const func = do {
      if (typeof value === 'function') {
        value;
      } else {
        () => {};
      }
    };
    return (...args) => this.out.cast(func(...args));
  }

  transform(transform) {
    return new this.constructor(transform(this.out));
  }
}
