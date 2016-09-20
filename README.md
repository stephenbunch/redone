# Computations and Dependencies
This library builds on the [Tracker architecture](https://github.com/meteor/docs/blob/version-NEXT/long-form/tracker-manual.md) developed by Meteor.

## A Simple Example
```js
import { Autorun, Dependency } from 'redone';

let colorDep = new Dependency();
let color = 'blue';

function getColor() {
  colorDep.depend();
  return color;
}

function setColor(value) {
  if (color !== value) {
    color = value;
    colorDep.changed();
  }
}

let autorun = Autorun.start(() => {
  console.log(getColor());
});
// "blue"

setColor('red');
// "red"

autorun.dispose();
setColor('green');
// (nothing printed)
```

## Forked Computations
```js
import { Autorun, Dependency } from 'redone';

let dep1 = new Dependency();
let dep2 = new Dependency();
let dep3 = new Dependency();

let autorun = Autorun.start(comp => {
  dep1.depend();
  console.log('run comp');

  comp.fork(childComp => {
    dep2.depend();
    console.log('run child comp');

    childComp.fork(() => {
      dep3.depend();
      console.log('run grandchild comp');
    });
  });
});
// "run comp"
// "run child comp"
// "run grandchild comp"

dep3.changed();
// "run grandchild comp"

dep2.changed();
// "run child comp"
// "run grandchild comp"

dep1.changed();
// "run comp"
// "run child comp"
// "run grandchild comp"

autorun.dispose();
dep3.changed();
// (nothing printed)
dep2.changed();
// (nothing printed)
dep1.changed();
// (nothing printed)
```

## Async Computations
```js
import { Autorun, Dependency } from 'redone';

let dep1 = new Dependency();
let dep2 = new Dependency();
let count = 0;

let autorun = Autorun.start(async comp => {
  dep1.depend();
  await Promise.resolve();

  comp.continue(() => {
    console.log('continued', ++count);
  });
});

await autorun.value;
// "continued", 1

dep1.changed();
dep1.changed();
await autorun.value;
// "continued", 2

dep2.changed();
await autorun.value;
// "continued", 3

dep1.changed();
autorun.dispose();
await autorun.value;
// (nothing printed)
```
