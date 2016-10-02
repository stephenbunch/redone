import { createProxy as reactiveComponentProxy } from './ReactiveComponent';
import { createProxy as multiPassComponentProxy } from './MultiPassComponent';

const middleware = [
  reactiveComponentProxy,
  multiPassComponentProxy,
];

export default function createProxy(Class, schemaFactory) {
  let contextTypes = { ...Class.contextTypes };
  let childContextTypes = { ...Class.childContextTypes };
  let Component = Class;
  for (const createProxy of middleware) {
    const proxy = createProxy(Component, schemaFactory);
    Component = proxy.Component;
    contextTypes = { ...contextTypes, ...proxy.contextTypes };
    childContextTypes = { ...childContextTypes, ...proxy.childContextTypes };
  }
  return { contextTypes, childContextTypes, Component };
}
