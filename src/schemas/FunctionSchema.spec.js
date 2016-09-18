/* global it expect */

import AnySchema from './AnySchema';
import FunctionSchema from './FunctionSchema';

const func = new FunctionSchema();

it('should inherit from AnySchema', () => {
  expect(func instanceof AnySchema).toBe(true);
});

it('should convert non function values to empty functions', () => {
  expect(func.cast(undefined)()).toBe(undefined);
  expect(func.cast('test')()).toBe(undefined);
});

it('should pass through for function values', () => {
  const callback = () => {};
  expect(func.cast(callback)).toBe(callback);
});
