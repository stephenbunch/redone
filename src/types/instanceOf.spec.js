/* global it expect */

import instanceOf from './instanceOf';
import InstanceSchema from '../schemas/InstanceSchema';

it('should be an instance of InstanceSchema', () => {
  expect(instanceOf(class Foo {}) instanceof InstanceSchema).toBe(true);
});
