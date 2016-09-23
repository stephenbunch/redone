/* global it expect */

import funcOf from './funcOf';
import any from './any';
import GenericFunctionSchema from '../schemas/GenericFunctionSchema';

it('should be an instance of GenericFunctionSchema', () => {
  expect(funcOf(any) instanceof GenericFunctionSchema).toBe(true);
});
