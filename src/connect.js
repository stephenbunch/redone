import React from 'react';

import { reactiveShape } from './Types';
import propTypesFromSpec from './propTypesFromSpec';

export default function connect(Component) {
  const { propTypes, stateTypes, contextTypes, childContextTypes, ...statics } = Component;
  const propsSchema = propTypes && reactiveShape(propTypes);
  const stateSchema = stateTypes && reactiveShape(stateTypes);
  const contextSchema = contextTypes && reactiveShape(contextTypes);

  class ReactiveComponent extends React.Component {
    contextTypes = contextTypes && propTypesFromSpec(contextTypes);
    childContextTypes = childContextTypes && propTypesFromSpec(childContextTypes);

    constructor(props, context) {
      super(props, context);
      this.component = Object.create(Component.prototype);
      this.component.props = propsSchema ? propsSchema.cast(props) : null;
      this.component.context = contextSchema ? contextSchema.cast(context) : null;
      this.component.state = stateSchema ? stateSchema.cast() : null;
      Component.call(this.component, this.component.props, this.component.context);
    }

    render() {
      return null;
    }
  }

  Object.defineProperty(ReactiveComponent, 'name', {
    value: Component.name,
  });
  Object.assign(ReactiveComponent, statics);
  return ReactiveComponent;
}
