/* global it expect */

import AnySchema from './AnySchema';
import OptionalSchema from './OptionalSchema';
import StringSchema from './StringSchema';

const string = new StringSchema();

it('should inherit from AnySchema', () => {
  const schema = new OptionalSchema(string);
  expect(schema instanceof AnySchema).toBe(true);
});

it('should return undefined if value is undefined', () => {
  const schema = new OptionalSchema(string);
  expect(schema.cast(undefined)).toBe(undefined);
  expect(schema.cast(null)).toEqual('');
});
