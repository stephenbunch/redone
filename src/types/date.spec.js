/* global it expect */

import date from './date';
import DateSchema from '../schemas/DateSchema';

it('should be an instance of DateSchema', () => {
  expect(date instanceof DateSchema).toBe(true);
});
