/* global it expect */

import ReadOnlyShapeSchema from './ReadOnlyShapeSchema';
import NumberSchema from './NumberSchema';

const number = new NumberSchema();

it('should return a read-only proxy to the passed object', () => {
  const shape = new ReadOnlyShapeSchema({
    foo: number,
  });
  const obj = { foo: '3' };
  const proxy = shape.cast(obj);
  expect(proxy.foo).toBe(3);
  expect(() => {
    proxy.foo = 2;
  }).toThrow();
  obj.foo = '5';
  expect(proxy.foo).toBe(5);
});

it('should work with nested objects', () => {
  const shape = new ReadOnlyShapeSchema({
    foo: new ReadOnlyShapeSchema({
      bar: number,
    }),
  });
  const obj = {
    foo: {
      bar: '3',
    },
  };
  const proxy = shape.cast(obj);
  expect(proxy.foo.bar).toBe(3);
  expect(() => {
    proxy.foo.bar = 2;
  }).toThrow();
  obj.foo.bar = '5';
  expect(proxy.foo.bar).toBe(5);
});

it('should have a toObject method', () => {
  const shape = new ReadOnlyShapeSchema({
    foo: number,
  });
  expect(shape.cast().toObject()).toEqual({ foo: 0 });
});

it('should have a toJSON method', () => {
  const shape = new ReadOnlyShapeSchema({
    foo: number,
  });
  expect(shape.cast().toJSON()).toEqual({ foo: 0 });
});

it('should pass through if the value is already of the same type', () => {
  const shape = new ReadOnlyShapeSchema({});
  const obj = shape.cast();
  expect(shape.cast(obj)).toBe(obj);
});
