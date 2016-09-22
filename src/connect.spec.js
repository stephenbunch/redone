/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* global it expect jest describe */

import React from 'react';
import { mount } from 'enzyme';

import { number, func } from './types';
import connect from './connect';

it('props should be read-only', () => {
  const ctor = jest.fn(function ctor() {
    expect(this.props.foo).toBe(2);
    expect(() => {
      this.props.foo = '3';
    }).toThrow();
  });
  const Foo = connect(class {
    static propTypes = {
      foo: number,
    };
    constructor() {
      ctor.call(this);
    }
  });
  const wrapper = mount(<Foo foo={2} />);
  expect(ctor).toBeCalled();
  wrapper.unmount();
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
  const wrapper = mount(<Foo />);
  expect(ctor).toBeCalled();
  wrapper.unmount();
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
  const wrapper = mount(<Foo />);
  expect(ctor).toBeCalled();
  wrapper.unmount();
});

it('should return a new class with the same name', () => {
  expect(connect(class Foo {}).name).toBe('Foo');
});

it('should render the component inside an autorun', () => {
  const Foo = connect(class {
    static stateTypes = {
      value: number,
    };

    compute() {
      this.state.value = 1;
    }

    render() {
      return (
        <div>
          <span className="value">{this.state.value}</span>
          <button
            onClick={() => {
              this.state.value += 1;
            }}
          >
            +
          </button>
        </div>
      );
    }
  });

  const wrapper = mount(<Foo />);
  expect(wrapper.find('.value').text()).toBe('1');

  wrapper.find('button').simulate('click');
  expect(wrapper.find('.value').text()).toBe('2');

  wrapper.unmount();
});

describe('setState', () => {
  it('should set all properties in one transaction', () => {
    let called = 0;
    const Foo = connect(class {
      static stateTypes = {
        a: number,
        b: number,
      };

      render() {
        called += 1;
        return (
          <div>
            {this.state.a}{this.state.b}
            <button
              onClick={() => {
                this.setState({
                  a: this.state.a + 1,
                  b: this.state.b + 1,
                });
              }}
            />
          </div>
        );
      }
    });

    const wrapper = mount(<Foo />);
    expect(called).toBe(1);

    wrapper.find('button').simulate('click');
    expect(called).toBe(2);

    wrapper.unmount();
  });
});

it('should update props', () => {
  let foo = 0;
  let bar = 0;
  let baz = 0;

  const Foo = connect(class {
    static propTypes = {
      render: func,
    };

    render() {
      foo += 1;
      return this.props.render();
    }
  });

  const Bar = connect(class {
    static propTypes = {
      value: number,
    };

    render() {
      bar += 1;
      return (
        <Foo render={() => <div>{this.props.value}</div>} />
      );
    }
  });

  const Baz = connect(class {
    static stateTypes = {
      value: number,
    };

    render() {
      baz += 1;
      return (
        <div>
          <button
            onClick={() => {
              this.state.value += 1;
            }}
          />
          <Bar value={this.state.value} />
        </div>
      );
    }
  });

  const wrapper = mount(<Baz />);
  expect(foo).toBe(1);
  expect(bar).toBe(1);
  expect(baz).toBe(1);

  wrapper.find('button').simulate('click');
  expect(foo).toBe(2);
  expect(bar).toBe(1);
  expect(baz).toBe(2);

  wrapper.unmount();
});

it('should fire lifecycle hooks', () => {
  const willMount = jest.fn();
  const didMount = jest.fn();
  const didUpdate = jest.fn();
  const willUnmount = jest.fn();

  const Foo = connect(class {
    static stateTypes = {
      value: number,
    };

    componentWillMount() {
      willMount();
    }

    componentDidMount() {
      didMount();
    }

    componentDidUpdate() {
      didUpdate();
    }

    componentWillUnmount() {
      willUnmount();
    }

    render() {
      return (
        <div>
          {this.state.value}
          <button
            onClick={() => {
              this.state.value += 1;
            }}
          />
        </div>
      );
    }
  });

  const wrapper = mount(<Foo />);
  expect(willMount.mock.calls.length).toBe(1);
  expect(didMount.mock.calls.length).toBe(1);
  expect(didUpdate.mock.calls.length).toBe(0);
  expect(willUnmount.mock.calls.length).toBe(0);

  wrapper.find('button').simulate('click');
  expect(willMount.mock.calls.length).toBe(1);
  expect(didMount.mock.calls.length).toBe(1);
  expect(didUpdate.mock.calls.length).toBe(1);
  expect(willUnmount.mock.calls.length).toBe(0);

  wrapper.unmount();
  expect(willMount.mock.calls.length).toBe(1);
  expect(didMount.mock.calls.length).toBe(1);
  expect(didUpdate.mock.calls.length).toBe(1);
  expect(willUnmount.mock.calls.length).toBe(1);
});

it('should pass context variables', () => {
  const Foo = connect(class {
    static contextTypes = {
      foo: number,
      bar: number,
    };

    render() {
      return (
        <div className="value">{this.context.foo}|{this.context.bar}</div>
      );
    }
  });

  const Bar = connect(class {
    static contextTypes = {
      foo: number,
    };

    static stateTypes = {
      value: number,
    };

    static childContextTypes = {
      bar: number,
    };

    compute() {
      this.state.value = this.context.foo;
    }

    getChildContext() {
      return {
        bar: Math.pow(this.state.value, 2),
      };
    }

    render() {
      return (
        <div>
          <Foo />
          <button
            onClick={() => {
              this.state.value += 1;
            }}
          />
        </div>
      );
    }
  });

  const wrapper = mount(<Bar />, {
    context: {
      foo: 2,
    },
  });
  expect(wrapper.find('.value').text()).toBe('2|4');

  wrapper.find('button').simulate('click');
  expect(wrapper.find('.value').text()).toBe('2|9');

  wrapper.unmount();
});

it('context should be read-only', () => {
  let called = false;
  const Foo = connect(class {
    static contextTypes = {
      foo: number,
    };

    constructor(props, context) {
      expect(context.foo).toBe(2);
      expect(() => {
        context.foo = 3;
      });
      called = true;
    }
  });
  const wrapper = mount(<Foo />, {
    context: {
      foo: 2,
    },
  });
  expect(called).toBe(true);
  wrapper.unmount();
});

it('should validate the component type', () => {
  expect(() => {
    connect(class Foo extends React.Component {});
  }).toThrow();
  expect(() => {
    connect('foo');
  }).toThrow();
});

it('defaultProps should work', () => {
  let called = false;
  const Foo = connect(class {
    static defaultProps = {
      foo: 2,
    };

    static propTypes = {
      foo: number,
    };

    constructor(props) {
      expect(props.foo).toBe(2);
      called = true;
    }
  });

  const wrapper = mount(<Foo />);
  expect(called).toBe(true);
  wrapper.unmount();
});
