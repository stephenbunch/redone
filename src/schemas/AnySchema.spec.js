/* global it expect */

import AnySchema from './AnySchema';

const any = new AnySchema();

it('should pass through', () => {
  const obj = {};
  expect(any.cast(obj)).toBe(obj);
});
