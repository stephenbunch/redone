/* global it expect */

import AnySchema from './AnySchema';
import NullableSchema from './NullableSchema';
import StringSchema from './StringSchema';

const string = new StringSchema();

it('should inherit from AnySchema', () => {
  const schema = new NullableSchema(string);
  expect(schema instanceof AnySchema).toBe(true);
});

it('should return null if value is null', () => {
  const schema = new NullableSchema(string);
  expect(schema.cast(null)).toBe(null);
  expect(schema.cast(undefined)).toEqual('');
});
