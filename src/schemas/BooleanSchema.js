import AnySchema from './AnySchema';

export default class BooleanSchema extends AnySchema {
  cast(value) {
    return !!value;
  }
}
