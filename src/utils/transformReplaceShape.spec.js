/* global it expect */

import transformReplaceShape from './transformReplaceShape';
import ReactiveShapeSchema from '../schemas/ReactiveShapeSchema';
import ShapeSchema from '../schemas/ShapeSchema';
import ArraySchema from '../schemas/ArraySchema';
import NumberSchema from '../schemas/NumberSchema';

it('should replace nested shapes', () => {
  const shape = new ShapeSchema({
    foo: new ArraySchema(
      new ShapeSchema({
        bar: new NumberSchema(),
      }),
    ),
  });
  const react = transformReplaceShape(shape, ReactiveShapeSchema);
  expect(react instanceof ReactiveShapeSchema);
  expect(react.keys.foo instanceof ArraySchema).toBe(true);
  expect(react.keys.foo.item instanceof ReactiveShapeSchema).toBe(true);
  expect(react.keys.foo.item.keys.bar instanceof NumberSchema).toBe(true);
});

it('is should support caching', () => {
  const foo = new ShapeSchema({
    foo: new NumberSchema(),
  });
  const bar = new ShapeSchema({
    bar: new NumberSchema(),
  });
  const cache = new Map();
  const rxFoo = transformReplaceShape(foo, ReactiveShapeSchema, cache);
  const rxBar = transformReplaceShape(bar, ReactiveShapeSchema, cache);
  expect(transformReplaceShape(foo, ReactiveShapeSchema, cache)).toBe(rxFoo);
  expect(transformReplaceShape(bar, ReactiveShapeSchema, cache)).toBe(rxBar);
});
