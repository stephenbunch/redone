/* global it expect */

import ShapeSchema from './ShapeSchema';
import ReactiveShapeSchema from './ReactiveShapeSchema';
import NumberSchema from './NumberSchema';
import Computation from '../Computation';

const number = new NumberSchema();

it('should inherit from ShapeSchema', () => {
  const shape = new ReactiveShapeSchema({
    foo: number,
  });
  expect(shape instanceof ShapeSchema).toBe(true);
});

it('should have an immutable structure', () => {
  const shape = new ReactiveShapeSchema({
    foo: number,
  });
  const obj = shape.cast(undefined);
  expect(obj.foo).toBe(0);
  obj.foo = '3';
  expect(obj.foo).toBe(3);
  delete obj.foo;
  expect(obj.foo).toBe(3);
  obj.foo = undefined;
  expect(obj.foo).toBe(0);
});

it('should pass through if the value is already of the same type', () => {
  const a = new ReactiveShapeSchema({
    foo: number,
  });
  const b = new ReactiveShapeSchema({
    bar: a,
    baz: a,
  });
  const obj = b.cast();
  obj.bar.foo = 2;
  obj.baz = obj.bar;
  expect(obj.bar).toBe(obj.baz);
});

it('should setup dependencies', () => {
  const shape = new ReactiveShapeSchema({
    foo: number,
  });
  const obj = shape.cast();
  let result;
  const comp = Computation.start(() => {
    result = obj.foo;
  });
  expect(result).toBe(0);
  obj.foo = 3;
  expect(result).toBe(3);
  comp.dispose();
});
