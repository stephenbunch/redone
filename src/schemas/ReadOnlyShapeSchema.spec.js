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
