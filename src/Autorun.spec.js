/* global it expect describe */

import Autorun from './Autorun';
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
  const autorun = Autorun.start(() => {
    dep.depend();
    count += 1;
  });
  dep.changed();
  dep.changed();
  expect(count).toBe(3);
  autorun.dispose();
});

it('should disconnect from previous dependencies on each new run', () => {
  const dep1 = new Dependency();
  const dep2 = new Dependency();
  let count = 0;
  const autorun = Autorun.start(() => {
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
  autorun.dispose();
});

it('should support nested computations', () => {
  const dep1 = new Dependency();
  const dep2 = new Dependency();
  const dep3 = new Dependency();
  let countA = 0;
  let countB = 0;
  let countC = 0;
  const autorun = Autorun.start(comp => {
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
  autorun.dispose();
});

it('should not run when disposed', () => {
  const dep1 = new Dependency();
  let count = 0;
  const autorun = Autorun.start(() => {
    dep1.depend();
    count += 1;
  });
  dep1.changed();
  autorun.dispose();
  dep1.changed();
  expect(count).toBe(2);
});

it('should throw an error if the function argument is not a function', () => {
  expect(() => {
    Autorun.start();
  }).toThrow();
});

it('should work with async computations', async () => {
  const dep1 = new Dependency();
  const dep2 = new Dependency();
  let countA = 0;
  let countB = 0;
  let promiseA = mockPromise();
  let promiseB = mockPromise();
  const autorun = Autorun.start(async comp => {
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
  autorun.dispose();
});

it('should not run again if a dependency is changed during the run', () => {
  const dep = new Dependency();
  let count = 0;
  const autorun = Autorun.start(() => {
    count += 1;
    dep.depend();
    dep.changed();
  });
  expect(count).toBe(1);
  dep.changed();
  expect(count).toBe(2);
  autorun.dispose();
});

describe('the fork function', () => {
  it('should not run if the parent has been disposed', () => {
    const dep = new Dependency();
    let count = 0;
    const autorun = Autorun.start(comp => {
      comp.fork(() => {
        dep.depend();
        count += 1;
      });
    });
    autorun.dispose();
    dep.changed();
    expect(count).toBe(1);
  });

  it('should forward the return value', () => {
    let result;
    const autorun = Autorun.start(comp => {
      result = comp.fork(() => 2);
    });
    expect(result).toBe(2);
    autorun.dispose();
  });
});

describe('the continue function', () => {
  it('should continue inside the computation', async () => {
    const dep1 = new Dependency();
    const dep2 = new Dependency();
    let called = 0;

    const autorun = Autorun.start(async comp => {
      dep1.depend();
      await Promise.resolve();
      comp.continue(() => {
        dep2.depend();
        called += 1;
      });
    });

    expect(autorun.value instanceof Promise).toBe(true);

    await autorun.value;
    expect(called).toBe(1);

    dep1.changed();
    await autorun.value;
    expect(called).toBe(2);

    dep2.changed();
    await autorun.value;
    expect(called).toBe(3);

    autorun.dispose();
  });

  it('should not run if the computation has been rerun', async () => {
    const dep = new Dependency();
    let called = 0;
    let nextCalled = 0;

    const autorun = Autorun.start(async comp => {
      dep.depend();
      called += 1;
      await Promise.resolve();
      comp.continue(() => {
        nextCalled += 1;
      });
    });
    expect(called).toBe(1);
    expect(nextCalled).toBe(0);

    await autorun.value;
    expect(nextCalled).toBe(1);

    dep.changed();
    dep.changed();
    expect(called).toBe(3);
    expect(nextCalled).toBe(1);

    await autorun.value;
    expect(nextCalled).toBe(2);
  });

  it('should forward the return value', () => {
    let result;
    const autorun = Autorun.start(comp => {
      result = comp.continue(() => 2);
    });
    autorun.dispose();
    expect(result).toBe(2);
  });
});

it('can be suspended and resumed', () => {
  const dep1 = new Dependency();
  const dep2 = new Dependency();
  let called = 0;
  const comp = Autorun.start(() => {
    dep1.depend();
    dep2.depend();
    called += 1;
  });
  expect(called).toBe(1);

  Autorun.suspend();
  Autorun.suspend();

  dep1.changed();
  dep2.changed();

  expect(called).toBe(1);

  Autorun.resume();
  expect(called).toBe(1);

  Autorun.resume();
  expect(called).toBe(2);

  comp.dispose();
});

describe('the never function', () => {
  it('should run the callback outside of any autorun', () => {
    const dep1 = new Dependency();
    const dep2 = new Dependency();
    let called = 0;
    const comp = Autorun.start(() => {
      dep1.depend();
      Autorun.never(() => {
        dep2.depend();
      });
      called += 1;
    });
    expect(called).toBe(1);

    dep1.changed();
    expect(called).toBe(2);

    dep2.changed();
    expect(called).toBe(2);

    comp.dispose();
  });

  it('should forward the return value', () => {
    let result;
    const comp = Autorun.start(() => {
      result = Autorun.never(() => 2);
    });
    expect(result).toBe(2);
    comp.dispose();
  });
});
