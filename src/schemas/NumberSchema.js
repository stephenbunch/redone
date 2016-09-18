import AnySchema from './AnySchema';

export default class NumberSchema extends AnySchema {
  cast(value) {
    const ret = Number(value);
    if (isNaN(ret)) {
      return 0;
    }
    return ret;
  }
}
