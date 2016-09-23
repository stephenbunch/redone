/* global it expect */

import toJson from './toJson';

it('should call toJSON on all its members', () => {
  const value = {
    foo: {
      toJSON: () => 2,
    },
  };
  const obj = toJson(value, ['foo']);
  expect(obj).toEqual({ foo: 2 });
});

it('should skip undefined values', () => {
  const value = {
    foo: 2,
    bar: undefined,
  };
  const obj = toJson(value, ['foo', 'bar']);
  expect(obj).toEqual({ foo: 2 });
});

it('should only set keys from the array', () => {
  const value = {
    foo: 2,
    bar: 3,
  };
  const obj = toJson(value, ['foo']);
  expect(obj).toEqual({ foo: 2 });
});
