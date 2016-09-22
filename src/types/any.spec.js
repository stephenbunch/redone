/* global it expect */

import any from './any';
import AnySchema from '../schemas/AnySchema';

it('should be an instance of AnySchema', () => {
  expect(any instanceof AnySchema).toBe(true);
});
