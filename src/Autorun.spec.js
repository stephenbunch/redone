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

it('should throw an error if a circular dependency is detected', () => {
  const dep = new Dependency();
  expect(() => {
    Autorun.start(() => {
      dep.depend();
      dep.changed();
    });
  }).toThrow();
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

  it('should return undefined if the autorun has been disposed', async () => {
    let result = 'foo';
    const autorun = Autorun.start(async comp => {
      await Promise.resolve();
      result = comp.fork(() => 2);
    });
    autorun.dispose();
    await autorun.value;
    expect(result).toBe(undefined);
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

describe('the once function', () => {
  it('should suspend reruns', () => {
    const dep1 = new Dependency();
    const dep2 = new Dependency();
    let called = 0;
    const autorun = Autorun.start(() => {
      dep1.depend();
      dep2.depend();
      called += 1;
    });
    expect(called).toBe(1);

    Autorun.once(() => {
      Autorun.once(() => {
        dep1.changed();
        dep2.changed();
        expect(called).toBe(1);
      });
      expect(called).toBe(1);
    });

    expect(called).toBe(2);

    autorun.dispose();
  });

  it('should forward the return value', () => {
    expect(Autorun.once(() => 2)).toBe(2);
  });
});

describe('the onceAsync function', () => {
  it('should suspend reruns', async () => {
    const dep1 = new Dependency();
    const dep2 = new Dependency();
    let called = 0;
    const autorun = Autorun.start(() => {
      dep1.depend();
      dep2.depend();
      called += 1;
    });
    expect(called).toBe(1);

    await Autorun.onceAsync(async () => {
      await Autorun.onceAsync(async () => {
        dep1.changed();
        await Promise.resolve();
        dep2.changed();
        expect(called).toBe(1);
      });
      expect(called).toBe(1);
    });

    expect(called).toBe(2);

    autorun.dispose();
  });

  it('should forward the return value', async () => {
    expect(await Autorun.onceAsync(() => Promise.resolve(2))).toBe(2);
  });

  it('should resume on error', async () => {
    const dep = new Dependency();
    let called = 0;
    const autorun = Autorun.start(() => {
      dep.depend();
      called += 1;
    });
    expect(called).toBe(1);

    const error = new Error('test');
    try {
      await Autorun.onceAsync(async () => {
        dep.changed();
        dep.changed();
        await Promise.reject(error);
        dep.changed();
      });
    } catch (err) {
      expect(err).toBe(error);
    }
    expect(called).toBe(2);

    dep.changed();
    expect(called).toBe(3);

    autorun.dispose();
  });
});

describe('the exclude function', () => {
  it('should run the callback outside of any autorun', () => {
    const dep1 = new Dependency();
    const dep2 = new Dependency();
    let called = 0;
    const autorun = Autorun.start(() => {
      dep1.depend();
      Autorun.exclude(() => {
        dep2.depend();
      });
      called += 1;
    });
    expect(called).toBe(1);

    dep1.changed();
    expect(called).toBe(2);

    dep2.changed();
    expect(called).toBe(2);

    autorun.dispose();
  });

  it('should forward the return value', () => {
    let result;
    const autorun = Autorun.start(() => {
      result = Autorun.exclude(() => 2);
    });
    expect(result).toBe(2);
    autorun.dispose();
  });
});

it('should throw an error when a circular dependency is detected between two computations', () => {
  const dep1 = new Dependency();
  const dep2 = new Dependency();

  const auto1 = Autorun.start(() => {
    dep1.depend();
    dep2.changed();
  });

  expect(() => {
    Autorun.start(() => {
      dep2.depend();
      dep1.changed();
    });
  }).toThrow();

  auto1.dispose();
});

it('should throw an error when a circular dependency is detected between two async computations', async () => {
  const dep1 = new Dependency();
  const dep2 = new Dependency();

  // 1. run auto1
  // 2. run auto2 -> dep1 changed -> run auto1 -> dep2 changed -> run auto2 -> dep1 changed -> error!

  const auto1 = Autorun.start(async comp => {
    dep1.depend();
    await Promise.resolve();
    comp.continue(() => {
      dep2.changed();
    });
  });
  await auto1.value;

  const auto2 = Autorun.start(async comp => {
    dep2.depend();
    await Promise.resolve();
    comp.continue(() => {
      dep1.changed();
    });
  });
  await auto2.value;
  await auto1.value;

  let error;
  try {
    await auto2.value;
  } catch (err) {
    error = err;
  }
  expect(error instanceof Error).toBe(true);

  auto1.dispose();
  auto2.dispose();
});

it('should throw an error when a circular dependency is detected between multiple segments of the same async computation', async () => {
  const dep = new Dependency();
  const autorun = Autorun.start(async comp => {
    dep.depend();
    await Promise.resolve();
    comp.continue(() => {
      dep.changed();
    });
  });

  let error;
  try {
    await autorun.value;
  } catch (err) {
    error = err;
  }
  expect(error instanceof Error).toBe(true);
  autorun.dispose();
});

it('should throw an error when a circular dependency is detected between two forks', () => {
  const dep1 = new Dependency();
  const dep2 = new Dependency();

  expect(() => {
    Autorun.start(comp => {
      comp.fork(() => {
        dep1.depend();
        dep2.changed();
      });

      comp.fork(() => {
        dep2.depend();
        dep1.changed();
      });
    });
  }).toThrow();
});
