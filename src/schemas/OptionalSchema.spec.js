/* global it expect */

import AnySchema from './AnySchema';
import OptionalSchema from './OptionalSchema';
import StringSchema from './StringSchema';
import NumberSchema from './NumberSchema';

const string = new StringSchema();
const number = new NumberSchema();

it('should inherit from AnySchema', () => {
  const schema = new OptionalSchema(string);
  expect(schema instanceof AnySchema).toBe(true);
});

it('should return undefined if value is undefined', () => {
  const schema = new OptionalSchema(string);
  expect(schema.cast(undefined)).toBe(undefined);
  expect(schema.cast(null)).toEqual('');
});

it('should be transformable', () => {
  const optionalNumber = new OptionalSchema(number);
  const optionalString = optionalNumber.transform(node => {
    if (node instanceof NumberSchema) {
      return string;
    }
    return node;
  });
  const num = optionalNumber.cast('3');
  const str = optionalString.cast(num);
  expect(str).toBe('3');
});
