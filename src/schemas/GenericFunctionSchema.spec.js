/* global it expect */

import GenericFunctionSchema from './GenericFunctionSchema';
import NumberSchema from './NumberSchema';
import AnySchema from './AnySchema';
import StringSchema from './StringSchema';

const number = new NumberSchema();
const string = new StringSchema();

it('should inherit from AnySchema', () => {
  expect(new GenericFunctionSchema(new AnySchema()) instanceof AnySchema).toBe(true);
});

it('should cast the return value', () => {
  const funcOfNumber = new GenericFunctionSchema(number);
  expect(funcOfNumber.cast(() => '3')()).toBe(3);
  expect(funcOfNumber.cast()()).toBe(0);
});

it('should be transformable', () => {
  const funcOfNumber = new GenericFunctionSchema(number);
  const funcOfString = funcOfNumber.transform(node => {
    if (node instanceof NumberSchema) {
      return string;
    }
    return node;
  });
  const num = funcOfNumber.cast(() => '3')();
  const str = funcOfString.cast(() => num)();
  expect(str).toBe('3');
});
