/* global it expect */

import Autorun from './Autorun';
import Datum from './Datum';

it('should hook into the autorun system', () => {
  const store = new Datum('h');
  let result = '';
  const auto = Autorun.start(() => {
    result += store.get();
  });
  store.set('el');
  store.set('lo');
  expect(result).toBe('hello');
  auto.dispose();
});
