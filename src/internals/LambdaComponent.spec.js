/* global it expect describe jest */

import LambdaComponent from './LambdaComponent';

describe('instance()', () => {
  it('it should return null when disposed', () => {
    const componentFactory = () => ({ dispose: jest.fn() });
    const lambda = new LambdaComponent(null, componentFactory);
    lambda.dispose();
    expect(lambda.instance()).toBe(null);
  });
});
