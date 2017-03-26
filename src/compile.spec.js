/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* global it expect jest describe */

import React from 'react';
import { mount } from 'enzyme';

import _compile from './compile';

const compile = _compile(React.Component);

it('should return a new class with the same name', () => {
  expect(compile(class Foo {}).name).toBe('Foo');
});

it('should validate the component type', () => {
  expect(() => {
    compile('foo');
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
  const Foo = _compile(React.Component, module)(class {
    dispose() {
      dispose();
    }
  }, module);
  Foo.prototype.forceUpdate = jest.fn();
  expect(module.hot.accept).toBeCalled();
  const wrapper = mount(<Foo />);
  const initialize = jest.fn();
  const compute = jest.fn();
  const Foo2 = _compile(React.Component, module)(class {
    initialize() {
      initialize();
    }
    compute() {
      compute();
    }
  });
  expect(Foo).toBe(Foo2);
  expect(dispose).toBeCalled();
  expect(initialize).toBeCalled();
  expect(compute).toBeCalled();
  expect(Foo.prototype.forceUpdate).toBeCalled();
  wrapper.unmount();
});

describe('get ReactComponent.state()', () => {
  it('should return null when the underlying component is disposed', () => {
    const Foo = compile(class Foo {});
    const foo = new Foo();
    foo.component.dispose();
    expect(foo.state).toBe(null);
  });
});
