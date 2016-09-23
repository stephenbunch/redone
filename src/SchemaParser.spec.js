/* global it expect */

import SchemaParser from './SchemaParser';
import InstanceSchema from './schemas/InstanceSchema';
import { string, number } from './types';

const parser = new SchemaParser();

it('supports parsing nested schemas', () => {
  const schema = parser.parse({
    foo: [{
      bar: number,
    }],
    baz: string,
  });
  expect(schema.cast()).toEqual({
    foo: [],
    baz: '',
  });
  expect(
    schema.cast({
      foo: [{
        bar: '3',
      }],
      baz: 2,
    })
  ).toEqual({
    foo: [{
      bar: 3,
    }],
    baz: '2',
  });
});

it('should parse functions as instanceOf types', () => {
  const schema = parser.parse(Promise);
  expect(schema instanceof InstanceSchema).toBe(true);
  expect(schema.type).toBe(Promise);
});

it('should pass through for schemas', () => {
  expect(parser.parse(number)).toBe(number);
});

it('should throw an error if the type is unknown', () => {
  expect(() => parser.parse('foo')).toThrow();
});

it('should throw an error is spec is not an object', () => {
  expect(() => parser.parseShape('foo')).toThrow();
  expect(() => parser.parseShape(Promise)).toThrow();
  expect(() => parser.parseShape(null)).toThrow();
  expect(() => parser.parseShape(0)).toThrow();
  expect(() => parser.parseShape()).toThrow();
});
