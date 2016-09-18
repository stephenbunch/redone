/* global it expect */

import AnySchema from './AnySchema';
import StringSchema from './StringSchema';

const string = new StringSchema();

it('should inherit from AnySchema', () => {
  expect(string instanceof AnySchema).toBe(true);
});

it('should convert null and undefined to empty string', () => {
  expect(string.cast(null)).toBe('');
  expect(string.cast(undefined)).toBe('');
});

it('should convert everything else to a string', () => {
  expect(string.cast(0)).toBe('0');
});
