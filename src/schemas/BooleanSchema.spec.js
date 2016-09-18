/* global it expect */

import AnySchema from './AnySchema';
import BooleanSchema from './BooleanSchema';

const bool = new BooleanSchema();

it('should inherit from AnySchema', () => {
  expect(bool instanceof AnySchema).toBe(true);
});

it('should convert truthy values to true', () => {
  expect(bool.cast(' ')).toBe(true);
  expect(bool.cast(1)).toBe(true);
  expect(bool.cast({})).toBe(true);
  expect(bool.cast([])).toBe(true);
});

it('should convert falsy values to false', () => {
  expect(bool.cast('')).toBe(false);
  expect(bool.cast(undefined)).toBe(false);
  expect(bool.cast(0)).toBe(false);
  expect(bool.cast(null)).toBe(false);
});
