/* eslint-disable import/no-extraneous-dependencies */
/* global it expect */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { number, any } from './types';
import _renderAsync from './renderAsync';
import _compile from './compile';
import Dependency from './Dependency';

const renderAsync = _renderAsync.bind(undefined, ReactDOMServer.renderToStaticMarkup);
const compile = _compile(React.Component);

it('should render components with async computes', async () => {
  const Foo = compile(class {
    static stateTypes = {
      value: number,
    };

    async compute() {
      this.state.value = await Promise.resolve(3);
    }

    render() {
      return <div>{this.state.value}</div>;
    }
  });

  const Bar = compile(class {
    static stateTypes = {
      value: number,
    };

    async compute() {
      this.state.value = await Promise.resolve(2);
    }

    render() {
      return (
        <div>
          {this.state.value}
          <Foo />
        </div>
      );
    }
  });

  const string = await renderAsync(<Bar />);
  expect(string).toBe('<div>2<div>3</div></div>');
});

it('should recover from errors in compute', async () => {
  const dep = new Dependency();
  const error = new Error('test');
  const Foo = compile(class {
    compute() {
      dep.depend();
      throw error;
    }
  });
  let errorResult;
  try {
    await renderAsync(<Foo />);
  } catch (err) {
    errorResult = err;
  }
  expect(errorResult).toBe(error);
  expect(dep.computations.length).toBe(1);
  expect(dep.computations[0].isAlive).toBe(false);
});

it('should recover from async errors in compute', async () => {
  const dep = new Dependency();
  const error = new Error('test');
  const Foo = compile(class {
    async compute(comp) {
      await Promise.resolve();
      comp.continue(() => {
        dep.depend();
        throw error;
      });
    }
  });
  let errorResult;
  try {
    await renderAsync(<Foo />);
  } catch (err) {
    errorResult = err;
  }
  expect(errorResult).toBe(error);
  expect(dep.computations.length).toBe(1);
  expect(dep.computations[0].isAlive).toBe(false);
});

it('should recover from errors in render', async () => {
  const dep = new Dependency();
  const error = new Error('test');
  const Foo = compile(class {
    render() {
      dep.depend();
      throw error;
    }
  });
  let errorResult;
  try {
    await renderAsync(<Foo />);
  } catch (err) {
    errorResult = err;
  }
  expect(errorResult).toBe(error);
  expect(dep.computations.length).toBe(1);
  expect(dep.computations[0].isAlive).toBe(false);
});

it('should recover from errors in componentWillMount', async () => {
  const error = new Error('test');
  const Foo = compile(class {
    componentWillMount() {
      throw error;
    }
  });
  let errorResult;
  try {
    await renderAsync(<Foo />);
  } catch (err) {
    errorResult = err;
  }
  expect(errorResult).toBe(error);
});

it('should recover from errors in sibling components', async () => {
  const dep = new Dependency();
  const error = new Error('test');
  const Foo = compile(class {
    async compute() {
      dep.depend();
      await Promise.resolve();
      throw error;
    }
  });
  const Bar = compile(class {
    async compute() {
      dep.depend();
      await Promise.resolve();
    }
  });
  let errorResult;
  try {
    await renderAsync(
      <div>
        <Foo />
        <Bar />
      </div>
    );
  } catch (err) {
    errorResult = err;
  }
  expect(errorResult).toBe(error);
  expect(dep.computations.length).toBe(2);
  expect(dep.computations[0].isAlive).toBe(false);
  expect(dep.computations[1].isAlive).toBe(false);
});

it('should only call methods once', async () => {
  let render = 0;
  let compute = 0;
  const Foo = compile(class {
    static propTypes = {
      children: any,
    };

    static stateTypes = {
      value: number,
    };

    async compute() {
      compute += 1;
      this.state.value = await Promise.resolve(2);
    }

    render() {
      render += 1;
      return (
        <div>
          {this.state.value}
          {this.props.children}
        </div>
      );
    }
  });
  const result = await renderAsync(
    <div data-thing>
      <Foo>
        <Foo />
        <Foo>
          <div data-thing>
            <Foo />
          </div>
        </Foo>
        <Foo />
      </Foo>
    </div>
  );
  expect(render).toBe(5);
  expect(compute).toBe(5);
  expect(result).toBe('<div data-thing="true"><div>2<div>2</div><div>2<div data-thing="true"><div>2</div></div></div><div>2</div></div></div>');
});
