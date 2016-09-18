import AnySchema from './AnySchema';

export default class ObjectSchema extends AnySchema {
  cast(value) {
    if (!value || typeof value !== 'object') {
      return {};
    }
    return value;
  }
}
