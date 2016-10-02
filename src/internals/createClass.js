import ReactiveComponent from './ReactiveComponent';
import MultiPassComponent from './MultiPassComponent';

export default function createClass(Component, schemaFactory) {
  return MultiPassComponent.createClass(
    ReactiveComponent.createClass(Component, schemaFactory),
    schemaFactory
  );
}
