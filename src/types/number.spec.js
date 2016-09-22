/* global it expect */

import number from './number';
import NumberSchema from '../schemas/NumberSchema';

it('should be an instance of NumberSchema', () => {
  expect(number instanceof NumberSchema).toBe(true);
});
