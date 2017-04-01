/* global it expect */

import ReactiveMapSchema from '../schemas/ReactiveMapSchema';
import mapOf from './mapOf';
import string from './string';

it('should create a reactive map schema', () => {
  const schema = mapOf(string, string);
  expect(schema).toBeInstanceOf(ReactiveMapSchema);
});
