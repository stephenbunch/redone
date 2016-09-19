/* global it expect describe */

import Computation from './Computation';
import Dependency from './Dependency';

function mockPromise() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}

it('should run again when the dependency changes', () => {
  const dep = new Dependency();
  let count = 0;
  const comp = Computation.start(() => {
    dep.depend();
    count += 1;
  });
  dep.changed();
  dep.changed();
  expect(count).toBe(3);
  comp.dispose();
});

it('should disconnect from previous dependencies on each new run', () => {
  const dep1 = new Dependency();
  const dep2 = new Dependency();
  let count = 0;
  const comp = Computation.start(() => {
    if (count === 0) {
      dep1.depend();
    } else {
      dep2.depend();
    }
    count += 1;
  });
  dep1.changed();
  expect(count).toBe(2);
  dep1.changed();
  expect(count).toBe(2);
  dep2.changed();
  expect(count).toBe(3);
  comp.dispose();
});

it('should support nested computations', () => {
  const dep1 = new Dependency();
  const dep2 = new Dependency();
  const dep3 = new Dependency();
  let countA = 0;
  let countB = 0;
  let countC = 0;
  const comp = Computation.start(comp => {
    dep1.depend();
    comp.fork(comp => {
      dep2.depend();
      comp.fork(() => {
        dep3.depend();
        countC += 1;
      });
      countB += 1;
    });
    countA += 1;
  });
  dep1.changed();
  expect(countA).toBe(2);
  expect(countB).toBe(2);
  expect(countC).toBe(2);
  dep2.changed();
  expect(countA).toBe(2);
  expect(countB).toBe(3);
  expect(countC).toBe(3);
  dep3.changed();
  expect(countA).toBe(2);
  expect(countB).toBe(3);
  expect(countC).toBe(4);
  dep1.changed();
  expect(countA).toBe(3);
  expect(countB).toBe(4);
  expect(countC).toBe(5);
  comp.dispose();
});

it('should not run when disposed', () => {
  const dep1 = new Dependency();
  let count = 0;
  const comp = Computation.start(() => {
    dep1.depend();
    count += 1;
  });
  dep1.changed();
  comp.dispose();
  dep1.changed();
  expect(count).toBe(2);
});

it('should throw an error if the function argument is not a function', () => {
  expect(() => {
    Computation.start();
  }).toThrow();
});

it('should not create a nested computation if the parent computation has been disposed', () => {
  const dep = new Dependency();
  let count = 0;
  Computation.start(comp => {
    comp.dispose();
    comp.fork(() => {
      dep.depend();
      count += 1;
    });
  });
  dep.changed();
  expect(count).toBe(1);
});

it('should work with async computations', async () => {
  const dep1 = new Dependency();
  const dep2 = new Dependency();
  let countA = 0;
  let countB = 0;
  let promiseA = mockPromise();
  let promiseB = mockPromise();
  const comp = Computation.start(async comp => {
    dep1.depend();
    await new Promise(resolve => setImmediate(resolve));
    await comp.fork(async () => {
      dep2.depend();
      await new Promise(resolve => setImmediate(resolve));
      countB += 1;
      promiseB.resolve(countB);
      promiseB = mockPromise();
    });
    countA += 1;
    promiseA.resolve(countA);
    promiseA = mockPromise();
  });
  expect(await Promise.all([promiseA, promiseB])).toEqual([1, 1]);
  dep2.changed();
  expect(await promiseB).toBe(2);
  dep1.changed();
  expect(await Promise.all([promiseA, promiseB])).toEqual([2, 3]);
  comp.dispose();
});

it('should not run again if a dependency is changed during the run', () => {
  const dep = new Dependency();
  let count = 0;
  const comp = Computation.start(() => {
    count += 1;
    dep.depend();
    dep.changed();
  });
  expect(count).toBe(1);
  dep.changed();
  expect(count).toBe(2);
  comp.dispose();
});

describe('the fork function', () => {
  it('should return the function value', () => {
    let result;
    const comp = Computation.start(comp => {
      result = comp.fork(() => 2);
    });
    expect(result).toBe(2);
    comp.dispose();
  });
});

describe('the task function', () => {
  it('should continue inside the computation', async () => {
    const dep1 = new Dependency();
    const dep2 = new Dependency();
    let called = 0;

    const comp = Computation.start(async comp => {
      dep1.depend();
      await comp.task(Promise.resolve()).then(() => {
        dep2.depend();
        called += 1;
      });
    });

    expect(comp.value instanceof Promise).toBe(true);

    await comp.value;
    expect(called).toBe(1);

    dep1.changed();
    await comp.value;
    expect(called).toBe(2);

    dep2.changed();
    await comp.value;
    expect(called).toBe(3);

    comp.dispose();
  });
});
