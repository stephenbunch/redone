import AnySchema from './AnySchema';

export default class StringSchema extends AnySchema {
  cast(value) {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  }
}
