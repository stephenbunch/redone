/* global it expect */

import toObject from './toObject';

it('should call toObject on all its members', () => {
  const value = {
    foo: {
      toObject: () => 2,
    },
  };
  const obj = toObject(value, ['foo']);
  expect(obj).toEqual({ foo: 2 });
});

it('should skip undefined values', () => {
  const value = {
    foo: 2,
    bar: undefined,
  };
  const obj = toObject(value, ['foo', 'bar']);
  expect(obj).toEqual({ foo: 2 });
});

it('should only set keys from the array', () => {
  const value = {
    foo: 2,
    bar: 3,
  };
  const obj = toObject(value, ['foo']);
  expect(obj).toEqual({ foo: 2 });
});
