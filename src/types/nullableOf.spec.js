/* global it expect */

import nullableOf from './nullableOf';
import any from './any';
import NullableSchema from '../schemas/NullableSchema';

it('should be an instance of NullableSchema', () => {
  expect(nullableOf(any) instanceof NullableSchema).toBe(true);
});
