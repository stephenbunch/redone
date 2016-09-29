/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* global it expect jest */

import React from 'react';
import { mount } from 'enzyme';
import getReactTypes from './getReactTypes';
import { number, string, func, bool, object, any } from '../types';

it('should return the react types', () => {
  const types = getReactTypes({
    number,
    string,
    func,
    bool,
    object,
    any,
  });
  expect(types.number).toBe(React.PropTypes.number);
  expect(types.string).toBe(React.PropTypes.string);
  expect(types.func).toBe(React.PropTypes.func);
  expect(types.bool).toBe(React.PropTypes.bool);
  expect(types.object).toBe(React.PropTypes.object);
  expect(types.any).toBe(React.PropTypes.any);
});

it('arrayOf should return arrayOf react type', () => {
  /* eslint-disable no-console */
  const _error = console.error;
  console.error = jest.fn();
  class Foo extends React.Component {
    static propTypes = getReactTypes({
      numbers: [number],
    });
    render() {
      return null;
    }
  }
  const wrapper = mount(<Foo numbers={[2]} />);
  wrapper.unmount();
  expect(console.error.mock.calls.length).toBe(0);
  const wrapper2 = mount(<Foo numbers={['2']} />);
  wrapper2.unmount();
  expect(console.error.mock.calls.length).toBe(1);
  expect(console.error.mock.calls[0][0]).toMatch(/Failed prop type/);
  console.error = _error;
  /* eslint-enable no-console */
});

it('shape should return shape of react types', () => {
  /* eslint-disable no-console */
  const _error = console.error;
  console.error = jest.fn();
  class Foo extends React.Component {
    static propTypes = getReactTypes({
      foo: {
        bar: number,
      },
    });
    render() {
      return null;
    }
  }
  const wrapper = mount(<Foo foo={{ bar: 2 }} />);
  wrapper.unmount();
  expect(console.error.mock.calls.length).toBe(0);
  const wrapper2 = mount(<Foo foo={{ bar: '2' }} />);
  wrapper2.unmount();
  expect(console.error.mock.calls.length).toBe(1);
  expect(console.error.mock.calls[0][0]).toMatch(/Failed prop type/);
  console.error = _error;
  /* eslint-enable no-console */
});
