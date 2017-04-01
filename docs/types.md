# Redone Types API

## Table of Contents
* [`any`](#any)
* [`arrayOf(type)`](#arrayoftype)
* [`bool`](#bool)
* [`date`](#date)
* [`func`](#func)
* [`funcOf(type)`](#funcoftype)
* [`instanceOf(type)`](#instanceoftype)
* [`mapOf(key, value)`](#mapofkeyvalue)
* [`nullableOf(type)`](#nullableoftype)
* [`number`](#number)
* [`object`](#object)
* [`optionalOf(type)`](#optionaloftype)
* [`string`](#string)
* [`shape(spec)`](#shapespec)

### `any`
A schema that allows any type.
```js
import { any } from 'redone/types';

const obj = {};
const val = any.cast(obj); // val === obj
```

### `arrayOf(type)`
Generates a schema that ensures that a value is an array of a given type.
```js
import { arrayOf, number } from 'redone/types';

const numbers = arrayOf(number);
numbers.cast(); // []
numbers.cast(['2', 'foo', 3]); // [2, 0, 3]
```

### `bool`
A schema that ensures that a value is a boolean.
```js
import { boolean } from 'redone/types';

bool.cast(''); // false
bool.cast(' '); // true
bool.cast(0); // false
bool.cast(1); // true
```

### `date`
A schema that ensures that a value is a date.
```js
import { date } from 'redone/types';

date.cast(null); // Wed Dec 31 1969 16:00:00 GMT-0800 (PST)
```

### `func`
A schema that ensures that a value is a function. If a value is not a function, an empty function is returned.
```js
import { func } from 'redone/types';

func.cast('foo'); // () => {}
```

### `funcOf(type)`
Generates a schema that ensures that a value is a function that returns a given type.
```js
import { funcOf, number } from 'redone/types';

const func = () => '3';
funcOf(number).cast(func)(); // 3
```

### `instanceOf(type)`
Generates a schema that asserts a value to be an instance of a certain type. **This schema throws an error instead of doing an implicit cast.**
```js
import { instanceOf } from 'redone/types';

class Foo {}
const foo = instanceOf(Foo);

foo.cast('foo'); // throws error

const instance = new Foo();
foo.cast(instance); // instance
```

### `mapOf(key, value)`
Generates a schema that ensures that a value is a Reactive Map of a given key and value type.
```js
import { mapOf, string, number } from 'redone/types';

const schema = mapOf(string, number);
const map = schema.cast({ 'foo': '42' });
map.set(2, 2);
Array.from(map.entries()); // [['foo', 42], ['2', 2]]
```

### `nullableOf(type)`
Generates a schema that ensures that a value is either `null` or the given type.
```js
import { nullableOf, string } from 'redone/types';

const nullableString = nullableOf(string);
nullableString.cast(''); // ''
nullableString.cast(null); // null
nullableString.cast(); // null
```

### `number`
A schema that ensures that a value is a number. Although `NaN` is a valid number, it's generally not useful, so this schema converts `NaN` to `0`.
```js
import { number } from 'redone/types';

number.cast(''); // 0
number.cast('1'); // 1
number.cast('1foo'); // 0
number.cast(NaN); // 0
```

### `object`
A schema that ensures that a value is an object. Although `null` is technically an object, the expectation is to return an empty object. Unlike `types/shape`, `types/object` doesn't cast any of its members and returns the same object instance rather than creating a copy.
```js
import { object } from 'redone/types';

const obj = {};
object.cast(obj); // obj
object.cast(null); // {}
```

### `optionalOf(type)`
Generates a schema that ensures that a value is either `undefined` or the given type.
```js
import { optionalOf, number } from 'redone/types';

const optionalNumber = optionalOf(number);
optionalNumber.cast(0); // 0
optionalNumber.cast(null); // 0
optionalNumber.cast(); // undefined
```

### `shape(spec)`
Generates a schema that ensures that a value is an object with a given shape.
```js
import { shape, number } from 'redone/types';

const type = shape({
  foo: number,
});
type.cast(); // { foo: 0 }
type.cast({ foo: '3' }); // { foo: 3 }
type.cast({ bar: 2, foo: 4 }); // { foo: 4 }
```

### `string`
A schema that ensures that a value is a string.
```js
import { string } from 'redone/types';

string.cast(0); // '0'
string.cast(1); // '1'
string.cast(null); // ''
string.cast(); // ''
```
