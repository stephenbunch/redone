/* global it expect */

import AnySchema from './AnySchema';
import DateSchema from './DateSchema';

const date = new DateSchema();

it('should inherit from AnySchema', () => {
  expect(date instanceof AnySchema).toBe(true);
});

it('should pass through if the value is already a date instance', () => {
  const value = new Date();
  expect(date.cast(value)).toBe(value);
});

it('should falsey values to a min date', () => {
  expect(+date.cast('')).toBe(+new Date(null));
});
