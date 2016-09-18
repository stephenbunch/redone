import AnySchema from './AnySchema';

export default class DateSchema extends AnySchema {
  cast(value) {
    if (value instanceof Date) {
      return value;
    }
    return new Date(value || null);
  }
}
