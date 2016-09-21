/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* global it expect jest */

import React from 'react';
import { shallow } from 'enzyme';

import { number } from './Types';
import connect from './connect';

it('props should be a reactive shape', () => {
  const ctor = jest.fn(function ctor() {
    expect(this.props.foo).toBe(2);
    this.props.foo = '3';
    expect(this.props.foo).toBe(3);
  });
  const Foo = connect(class {
    static propTypes = {
      foo: number,
    };
    constructor() {
      ctor.call(this);
    }
  });
  shallow(<Foo foo={2} />);
  expect(ctor).toBeCalled();
});

it('should default to null if no types are defined', () => {
  const ctor = jest.fn(function ctor() {
    expect(this.state).toBe(null);
    expect(this.context).toBe(null);
    expect(this.props).toBe(null);
  });
  const Foo = connect(class {
    constructor() {
      ctor.call(this);
    }
  });
  shallow(<Foo />);
  expect(ctor).toBeCalled();
});

it('should pass props and context into the constructor', () => {
  const ctor = jest.fn(function ctor(props, context) {
    expect(props).toBe(this.props);
    expect(context).toBe(this.context);
  });
  const Foo = connect(class {
    constructor(...args) {
      ctor.call(this, ...args);
    }
  });
  shallow(<Foo />);
  expect(ctor).toBeCalled();
});
