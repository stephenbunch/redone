/* global it expect */

import shape from './shape';
import ShapeSchema from '../schemas/ShapeSchema';

it('should be an instance of ShapeSchema', () => {
  expect(shape({}) instanceof ShapeSchema).toBe(true);
});
