/* global it expect */

import SchemaParser from './SchemaParser';
import StringSchema from './StringSchema';
import NumberSchema from './NumberSchema';

const parser = new SchemaParser();
const string = new StringSchema();
const number = new NumberSchema();

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
