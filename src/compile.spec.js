/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* global it expect jest describe */

import React from 'react';
import { mount } from 'enzyme';

import { number, func, string } from './types';
import connect from './connect';

it('should return a new class with the same name', () => {
  expect(connect(class Foo {}).name).toBe('Foo');
});

it('should validate the component type', () => {
  expect(() => {
    connect(class Foo extends React.Component {});
  }).toThrow();
  expect(() => {
    connect('foo');
  }).toThrow();
});

it('should support webpack HMR', () => {
  const dispose = jest.fn();
  const module = {
    id: 42,
    hot: {
      accept: jest.fn(),
    },
  };
  const Foo = connect(class {
    dispose() {
      dispose();
    }
  }, module);
  Foo.prototype.forceUpdate = jest.fn();
  expect(module.hot.accept).toBeCalled();
  const wrapper = mount(<Foo />);
  const ctor = jest.fn();
  const compute = jest.fn();
  const Foo2 = connect(class {
    constructor() {
      ctor();
    }

    compute() {
      compute();
    }
  }, module);
  expect(Foo).toBe(Foo2);
  expect(dispose).toBeCalled();
  expect(ctor).toBeCalled();
  expect(compute).toBeCalled();
  expect(Foo.prototype.forceUpdate).toBeCalled();
  wrapper.unmount();
});
