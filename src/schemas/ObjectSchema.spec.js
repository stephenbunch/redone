/* global it expect */

import AnySchema from './AnySchema';
import ObjectSchema from './ObjectSchema';

const object = new ObjectSchema();

it('should inherit from AnySchema', () => {
  expect(object instanceof AnySchema).toBe(true);
});

it('should convert non object values to an empty object', () => {
  expect(object.cast('test')).toEqual({});
});

it('should pass through for object values', () => {
  const obj = {};
  expect(object.cast(obj)).toBe(obj);
});
