import defaultSchemaFactory from './internals/defaultSchemaFactory';
import compile from './compile';

export default function connect(Class, module) {
  return compile(Class, defaultSchemaFactory, module);
}
