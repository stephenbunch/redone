import ReactiveComponent from './ReactiveComponent';
import StaticAsyncRenderComponent from './StaticAsyncRenderComponent';

export default function createClass(Component, schemaFactory) {
  return StaticAsyncRenderComponent.createClass(
    ReactiveComponent.createClass(Component, schemaFactory),
    schemaFactory
  );
}
