/* global it expect */

import AnySchema from './AnySchema';
import NullableSchema from './NullableSchema';
import StringSchema from './StringSchema';
import NumberSchema from './NumberSchema';

const string = new StringSchema();
const number = new NumberSchema();

it('should inherit from AnySchema', () => {
  const schema = new NullableSchema(string);
  expect(schema instanceof AnySchema).toBe(true);
});

it('should return null if value is null', () => {
  const schema = new NullableSchema(string);
  expect(schema.cast(null)).toBe(null);
  expect(schema.cast(undefined)).toEqual(null);
});

it('should be transformable', () => {
  const nullableNumber = new NullableSchema(number);
  const nullableString = nullableNumber.transform(node => {
    if (node instanceof NumberSchema) {
      return string;
    }
    return node;
  });
  const num = nullableNumber.cast('3');
  const str = nullableString.cast(num);
  expect(str).toBe('3');
});
