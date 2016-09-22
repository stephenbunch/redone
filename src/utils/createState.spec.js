/* global it expect */

import createState from './createState';
import { number } from '../types';

it('should create a reactive shape', () => {
  const state = createState({
    foo: number,
  });
  expect(state.foo).toBe(0);
});
