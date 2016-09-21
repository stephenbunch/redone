/* global it expect */

import React from 'react';
import getReactTypes from './getReactTypes';
import { number, string, func, bool } from './Types';

it('should return the react types', () => {
  const types = getReactTypes({
    number,
    string,
    func,
    bool,
  });
  console.log(Object.keys(types));
  expect(types.number).toBe(React.PropTypes.number);
  expect(types.string).toBe(React.PropTypes.string);
  expect(types.func).toBe(React.PropTypes.func);
  expect(types.bool).toBe(React.PropTypes.bool);
});
