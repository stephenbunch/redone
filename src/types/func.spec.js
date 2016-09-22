/* global it expect */

import func from './func';
import FunctionSchema from '../schemas/FunctionSchema';

it('should be an instance of FunctionSchema', () => {
  expect(func instanceof FunctionSchema).toBe(true);
});
