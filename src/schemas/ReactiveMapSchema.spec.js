/* global it expect */

import ReactiveMapSchema from './ReactiveMapSchema';
import StringSchema from './StringSchema';
import NumberSchema from './NumberSchema';
import Autorun from '../Autorun';

const string = new StringSchema();
const number = new NumberSchema();

it('should cast objects', () => {
  const schema = new ReactiveMapSchema(number, string);
  const map = schema.cast({
    '42': 2,
  });
  expect(map.get(42)).toBe('2');
});

it('should cast maps', () => {
  const schema = new ReactiveMapSchema(number, string);
  const someMap = new Map();
  someMap.set('42', 2);
  const map = schema.cast(someMap);
  expect(map.get(42)).toBe('2');
});

it('should not cast itself', () => {
  const schema = new ReactiveMapSchema(number, string);
  const map = schema.cast();
  const map2 = schema.cast(map);
  expect(map).toBe(map2);
});

it('should cast other reactive maps with different schemas', () => {
  const schema = new ReactiveMapSchema(number, string);
  const schema2 = new ReactiveMapSchema(string, number);
  const map = schema.cast({ '42': 2 });
  expect(map.get(42)).toBe('2');
  const map2 = schema2.cast(map);
  expect(map2.get('42')).toBe(2);
});

it('should track a dependency when getting size', () => {
  const schema = new ReactiveMapSchema(number, string);
  const map = schema.cast();
  let size = null;
  let called = 0;
  const auto = Autorun.start(() => {
    called += 1;
    size = map.size;
  });
  map.set(1, 'hello');
  expect(size).toBe(1);
  map.set(2, 'world');
  expect(size).toBe(2);
  // Changing the value of a key should not trigger a change.
  map.set(1, 'foo');
  expect(called).toBe(3);
  auto.dispose();
});

it('should track a dependency when getting value', () => {
  const schema = new ReactiveMapSchema(string, string);
  const map = schema.cast();
  let called = 0;
  let value = null;
  const auto = Autorun.start(() => {
    called += 1;
    value = map.get('foo');
  });
  map.set('foo', 'bar');
  expect(value).toBe('bar');
  expect(called).toBe(2);
  // Setting a different key should not trigger a change.
  map.set('hello', 'world');
  expect(called).toBe(2);
  auto.dispose();
});

it('should be transformable', () => {
  const schema = new ReactiveMapSchema(string, string);
  const schema2 = schema.transform(() => number);
  const map = schema2.cast();
  map.set('2', '2');
  expect(map.get(2)).toBe(2);
});

it('should track a dependency when getting the keys', () => {
  const schema = new ReactiveMapSchema(string, number);
  const map = schema.cast();
  const output = [];
  const auto = Autorun.start(() => {
    output.push(Array.from(map.keys()));
  });
  map.set('foo', 2);
  map.set('bar', 2);
  // Changing the value of a key should not trigger a change.
  map.set('bar', 42);
  map.delete('foo');
  expect(output).toEqual([
    [],
    ['foo'],
    ['foo', 'bar'],
    ['bar'],
  ]);
  auto.dispose();
});

it('should track a dependency when getting the values', () => {
  const schema = new ReactiveMapSchema(string, number);
  const map = schema.cast();
  const output = [];
  const auto = Autorun.start(() => {
    output.push(Array.from(map.values()));
  });
  map.set('foo', 2);
  map.set('bar', 2);
  map.set('bar', 42);
  map.delete('foo');
  expect(output).toEqual([
    [],
    [2],
    [2, 2],
    [2, 42],
    [42],
  ]);
  auto.dispose();
});

it('should track a dependency when getting the entries', () => {
  const schema = new ReactiveMapSchema(string, number);
  const map = schema.cast();
  const output = [];
  const auto = Autorun.start(() => {
    output.push(Array.from(map.entries()));
  });
  map.set('foo', 2);
  map.set('bar', 2);
  map.set('bar', 42);
  map.delete('foo');
  expect(output).toEqual([
    [],
    [['foo', 2]],
    [['foo', 2], ['bar', 2]],
    [['foo', 2], ['bar', 42]],
    [['bar', 42]],
  ]);
  auto.dispose();
});

it('should track a dependency when getting the iterator', () => {
  const schema = new ReactiveMapSchema(string, number);
  const map = schema.cast();
  const output = [];
  const auto = Autorun.start(() => {
    output.push(Array.from(map[Symbol.iterator]()));
  });
  map.set('foo', 2);
  map.set('bar', 2);
  map.set('bar', 42);
  map.delete('foo');
  expect(output).toEqual([
    [],
    [['foo', 2]],
    [['foo', 2], ['bar', 2]],
    [['foo', 2], ['bar', 42]],
    [['bar', 42]],
  ]);
  auto.dispose();
});

it('should track a dependency when getting whether a key exists', () => {
  const schema = new ReactiveMapSchema(string, number);
  const map = schema.cast();
  let has = null;
  let called = 0;
  const auto = Autorun.start(() => {
    called += 1;
    has = map.has('foo');
  });
  expect(has).toBe(false);
  map.set('foo', 2);
  expect(has).toBe(true);
  // Changing the value should not trigger a change.
  map.set('foo', 3);
  expect(called).toBe(2);
  map.delete('foo');
  expect(has).toBe(false);
  auto.dispose();
});
