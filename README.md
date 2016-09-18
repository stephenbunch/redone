# Computations and Dependencies
This library builds on the [Tracker architecture](https://github.com/meteor/docs/blob/version-NEXT/long-form/tracker-manual.md) developed by Meteor.

## A Simple Example
```js
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

let comp = Computation.start(() => {
  console.log(getColor());
});
// "blue"

setColor('red');
// "red"

comp.dispose();
setColor('green');
// (nothing printed)
```

## Forked Computations
```js
let dep1 = new Dependency();
let dep2 = new Dependency();
let dep3 = new Dependency();

let comp = Computation.start(comp => {
  dep1.depend();
  console.log('run comp');

  comp.fork(childComp => {
    dep2.depend();
    console.log('run child comp');

    childComp.fork(grandchildComp => {
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

comp.dispose();
dep3.changed();
// (nothing printed)
dep2.changed();
// (nothing printed)
dep1.changed();
// (nothing printed)
```
