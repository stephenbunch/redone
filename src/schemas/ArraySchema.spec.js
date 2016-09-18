/* global it expect */

import AnySchema from './AnySchema';
import ArraySchema from './ArraySchema';
import NumberSchema from './NumberSchema';
import StringSchema from './StringSchema';

const any = new AnySchema();
const arrayOf = schema => new ArraySchema(schema);
const number = new NumberSchema();
const string = new StringSchema();

it('should inherit from AnySchema', () => {
  expect(arrayOf(any) instanceof AnySchema).toBe(true);
});

it('should cast non array values to an empty array', () => {
  const array = arrayOf(any);
  expect(array.cast(undefined)).toEqual([]);
  expect(array.cast(2)).toEqual([]);
  expect(array.cast({})).toEqual([]);
});

it('should cast each item according to the supplied schema', () => {
  expect(arrayOf(number).cast(['5', '6'])).toEqual([5, 6]);
  expect(arrayOf(string).cast([5, 6])).toEqual(['5', '6']);
});

it('should be transformable', () => {
  const a = arrayOf(number);
  const b = a.transform(node => node === number ? string : number);
  expect(b.cast([1, 2])).toEqual(['1', '2']);
});
