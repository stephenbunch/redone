/* global it expect */

import string from './string';
import StringSchema from '../schemas/StringSchema';

it('should be an instance of StringSchema', () => {
  expect(string instanceof StringSchema).toBe(true);
});
