/* global it expect */

import React from 'react';
import { number } from './types';
import renderAsync from './renderAsync';
import connect from './connect';

it('should render components with async computes', async () => {
  const Foo = connect(class {
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

  const Bar = connect(class {
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
