/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* global it expect jest describe */

import React from 'react';
import { mount } from 'enzyme';

import { number, func, string } from '../types';
import _compile from '../compile';

const compile = _compile(React.Component);

it('the props should be read-only', () => {
  const initialize = jest.fn(function initialize() {
    expect(this.props.foo).toBe(2);
    expect(() => {
      this.props.foo = '3';
    }).toThrow();
  });
  const Foo = compile(class {
    static propTypes = {
      foo: number,
    };
    initialize() {
      initialize.call(this);
    }
  });
  const wrapper = mount(<Foo foo={2} />);
  expect(initialize).toBeCalled();
  wrapper.unmount();
});

it('should default to null if no types are defined', () => {
  const initialize = jest.fn(function initialize() {
    expect(this.state).toBe(null);
    expect(this.props).toBe(null);
  });
  const Foo = compile(class {
    initialize() {
      initialize.call(this);
    }
  });
  const wrapper = mount(<Foo />);
  expect(initialize).toBeCalled();
  wrapper.unmount();
});

it('should render the component inside an autorun', () => {
  const Foo = compile(class {
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
    const Foo = compile(class {
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

it('should update the props', () => {
  let foo = 0;
  let bar = 0;
  let baz = 0;

  const Foo = compile(class {
    static propTypes = {
      render: func,
    };

    render() {
      foo += 1;
      return this.props.render();
    }
  });

  const Bar = compile(class {
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

  const Baz = compile(class {
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

  const Foo = compile(class {
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

it('should forward setState calls for easier testing', () => {
  const Foo = compile(class {
    static stateTypes = {
      value: number,
    };

    render() {
      return (
        <div>{this.state.value}</div>
      );
    }
  });

  const wrapper = mount(<Foo />);
  expect(wrapper.find('div').text()).toBe('0');

  wrapper.setState({
    value: 2,
  });
  expect(wrapper.find('div').text()).toBe('2');

  wrapper.unmount();
});

it('should expose the state object for easier testing', () => {
  const Foo = compile(class {
    static stateTypes = {
      value: number,
    };

    initialize() {
      this.state.value = 2;
    }

    render() {
      return (
        <div>{this.state.value}</div>
      );
    }
  });

  const wrapper = mount(<Foo />);
  expect(wrapper.state('value')).toBe(2);

  wrapper.unmount();
});

it('the state should be settable', () => {
  const initialize = jest.fn();

  const Foo = compile(class {
    static stateTypes = {
      value: number,
    };

    initialize() {
      expect(this.state.value).toBe(0);
      this.state = { value: '2' };
      expect(this.state.value).toBe(2);
      this.state = undefined;
      expect(this.state.value).toBe(0);
      initialize();
    }
  });

  const wrapper = mount(<Foo />);
  expect(initialize).toBeCalled();

  wrapper.unmount();
});

it('setting the state should throw an error if no state types are specified', () => {
  const Foo = compile(class {
    initialize() {
      this.state = { foo: 2 };
    }
  });
  expect(() => {
    mount(<Foo />);
  }).toThrow();
});

it('setting the state to null should not throw throw an error', () => {
  const Foo = compile(class {
    initialize() {
      this.state = null;
    }
  });
  mount(<Foo />).unmount();
});

it('should support the callback parameter of setState', () => {
  let result = '';
  const Foo = compile(class {
    static stateTypes = {
      value: string,
    };

    componentDidUpdate() {
      result += 'hello';
    }

    render() {
      return (
        <div>
          {this.state.value}
        </div>
      );
    }
  });

  const wrapper = mount(<Foo />);
  wrapper.instance().setState({ value: 'foo' }, () => {
    result += 'world';
  });
  wrapper.unmount();
  expect(result).toBe('helloworld');
});

it('should fire the dispose method when unmounting', () => {
  let called = false;
  const Foo = compile(class {
    dispose() {
      called = true;
    }
  });

  const wrapper = mount(<Foo />);
  wrapper.unmount();
  expect(called).toBe(true);
});

it('should default render result to null if undefined', () => {
  const Foo = compile(class {
    render() {
      return undefined;
    }
  });
  // should not throw an error because null should be
  // returned instead by the proxy
  mount(<Foo />).unmount();
});
