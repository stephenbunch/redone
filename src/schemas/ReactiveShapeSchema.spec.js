/* global it expect */

import ShapeSchema from './ShapeSchema';
import ReactiveShapeSchema from './ReactiveShapeSchema';
import NumberSchema from './NumberSchema';
import Autorun from '../Autorun';
import FunctionSchema from './FunctionSchema';

const number = new NumberSchema();
const func = new FunctionSchema();

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
  const autorun = Autorun.start(() => {
    result = obj.foo;
  });
  expect(result).toBe(0);
  obj.foo = 3;
  expect(result).toBe(3);
  autorun.dispose();
});

it('should only run once when setting a nested shape node', () => {
  const shape = new ReactiveShapeSchema({
    foo: new ReactiveShapeSchema({
      bar: number,
      baz: number,
    }),
  });
  const obj = shape.cast();

  let called = 0;
  const autorun = Autorun.start(() => {
    obj.foo.bar;
    obj.foo.baz;
    called += 1;
  });
  expect(called).toBe(1);

  obj.foo = {
    bar: 3,
    baz: 4,
  };
  expect(called).toBe(2);

  autorun.dispose();
});

it('should automatically bind function values', () => {
  const foo = {
    bar() {
      return this;
    },
  };
  const shape = new ReactiveShapeSchema({
    bar: func,
  });
  expect(shape.cast(foo).bar()).toBe(foo);
});

it('should have a toObject method', () => {
  const shape = new ReactiveShapeSchema({
    foo: number,
  });
  expect(shape.cast().toObject()).toEqual({ foo: 0 });
});

it('should have a toJSON method', () => {
  const shape = new ReactiveShapeSchema({
    foo: number,
  });
  expect(shape.cast().toJSON()).toEqual({ foo: 0 });
});
