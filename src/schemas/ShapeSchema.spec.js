/* global it expect */

import AnySchema from './AnySchema';
import ShapeSchema from './ShapeSchema';
import NumberSchema from './NumberSchema';
import StringSchema from './StringSchema';

const number = new NumberSchema();
const string = new StringSchema();

it('should inherit from AnySchema', () => {
  const shape = new ShapeSchema({});
  expect(shape instanceof AnySchema).toBe(true);
});

it('should cast undefined to an empty shape', () => {
  const shape = new ShapeSchema({
    foo: number,
    bar: string,
  });
  expect(shape.cast(undefined)).toEqual({
    foo: 0,
    bar: '',
  });
});
