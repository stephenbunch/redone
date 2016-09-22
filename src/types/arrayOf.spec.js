/* global it expect */

import arrayOf from './arrayOf';
import any from './any';
import ArraySchema from '../schemas/ArraySchema';

it('should be an instance of ArraySchema', () => {
  expect(arrayOf(any) instanceof ArraySchema).toBe(true);
});
