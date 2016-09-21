/* global it expect */

import AnySchema from './AnySchema';
import InstanceSchema from './InstanceSchema';

it('should inherit from AnySchema', () => {
  expect(new InstanceSchema(class {}) instanceof AnySchema).toBe(true);
});

it('should throw an error when casting something of a different instance', () => {
  class Foo {}
  class Bar {}
  const schema = new InstanceSchema(Foo);
  const foo = new Foo();
  expect(schema.cast(foo)).toBe(foo);
  expect(() => {
    schema.cast(new Bar());
  }).toThrow();
});
