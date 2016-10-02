import reactiveComponentClass from './reactiveComponentClass';
import staticAsyncRenderComponentClass from './staticAsyncRenderComponentClass';

export default function transformClass(Component, schemaFactory) {
  return staticAsyncRenderComponentClass(
    reactiveComponentClass(Component, schemaFactory),
    schemaFactory
  );
}
