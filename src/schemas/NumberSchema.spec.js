/* global it expect */

import AnySchema from './AnySchema';
import NumberSchema from './NumberSchema';

const number = new NumberSchema();

it('should inherit from AnySchema', () => {
  expect(number instanceof AnySchema).toBe(true);
});

it('should return 0 instead of NaN', () => {
  expect(number.cast('foo')).toBe(0);
});
