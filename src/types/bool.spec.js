/* global it expect */

import bool from './bool';
import BooleanSchema from '../schemas/BooleanSchema';

it('should be an instance of BooleanSchema', () => {
  expect(bool instanceof BooleanSchema).toBe(true);
});
