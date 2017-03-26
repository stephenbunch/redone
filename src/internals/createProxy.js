import { createProxy as reactiveComponentProxy } from './ReactiveComponent';
import { createProxy as multiPassComponentProxy } from './MultiPassComponent';

export default function createProxy(Class, schemaFactory) {
  return multiPassComponentProxy(
    reactiveComponentProxy(Class, schemaFactory),
    schemaFactory
  );
}
