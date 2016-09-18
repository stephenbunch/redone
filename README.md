# Computations and Dependencies

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
