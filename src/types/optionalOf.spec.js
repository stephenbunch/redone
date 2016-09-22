/* global it expect */

import optionalOf from './optionalOf';
import any from './any';
import OptionalSchema from '../schemas/OptionalSchema';

it('should be an instance of OptionalSchema', () => {
  expect(optionalOf(any) instanceof OptionalSchema).toBe(true);
});
