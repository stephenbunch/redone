/* global it expect */

import object from './object';
import ObjectSchema from '../schemas/ObjectSchema';

it('should be an instance of ObjectSchema', () => {
  expect(object instanceof ObjectSchema).toBe(true);
});
