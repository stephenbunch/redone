import AnySchema from './AnySchema';

export default class FunctionSchema extends AnySchema {
  cast(value) {
    if (typeof value === 'function') {
      return value;
    }
    return () => {};
  }
}
