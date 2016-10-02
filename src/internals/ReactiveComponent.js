import Autorun from '../Autorun';
import extendStatic from './extendStatic';

function isFunc(prop) {
  return typeof prop === 'function';
}

function setState(state, callback) {
  Autorun.once(() => Object.assign(this.state, state));
  if (callback) {
    callback();
  }
}

export default class ReactiveComponent {
  static createClass(Component, schemaFactory) {
    return extendStatic(this, {
      ...schemaFactory(Component),
      Component,
      contextTypes: Component.contextTypes,
      childContextTypes: Component.childContextTypes,
    });
  }

  constructor(props, context, delegate) {
    this.delegate = delegate;

    const {
      Component,
      propsSchema,
      stateSchema,
      contextSchema,
      publicPropsSchema,
      publicContextSchema,
    } = this.constructor;

    this.props = propsSchema ? propsSchema.cast(props) : null;
    this.context = contextSchema ? contextSchema.cast(context) : null;
    this.state = stateSchema ? stateSchema.cast() : null;

    this.component = Object.create(Component.prototype);
    Object.defineProperty(this.component, 'props', {
      value: propsSchema ? publicPropsSchema.cast(this.props) : null,
    });
    Object.defineProperty(this.component, 'context', {
      value: contextSchema ? publicContextSchema.cast(this.context) : null,
    });
    Object.defineProperty(this.component, 'state', {
      get: () => this.state && this.state.value,
      set: nextState => {
        if (this.state === null) {
          if (nextState === null) {
            return;
          }
          throw new Error('State types must be specified to use the state.');
        }
        this.state.value = nextState;
      },
    });
    Object.defineProperty(this.component, 'setState', {
      value: setState,
    });
    Component.call(this.component, this.component.props, this.component.context);

    this.renderAutorun = null;
    this.element = null;
    this.childContextAutorun = null;
    this.childContext = null;
    this.computeAutorun = null;
  }

  instance() {
    return this.component;
  }

  compute() {
    if (isFunc(this.component.compute)) {
      if (this.computeAutorun === null) {
        this.computeAutorun = Autorun.start(comp =>
          this.component.compute(comp)
        );
      }
      return this.computeAutorun.value;
    }
    return undefined;
  }

  getChildContext() {
    if (isFunc(this.component.getChildContext)) {
      this.childContextAutorun = Autorun.start(comp => {
        this.childContext = this.component.getChildContext();
        if (!comp.isFirstRun) {
          Autorun.exclude(() => {
            this.delegate.forceUpdate();
          });
        }
      });
    }
    return this.childContext;
  }

  componentWillMount() {
    if (isFunc(this.component.componentWillMount)) {
      this.component.componentWillMount();
    }
  }

  componentDidMount() {
    if (isFunc(this.component.componentDidMount)) {
      this.component.componentDidMount();
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    Autorun.once(() => {
      if (this.props) {
        Object.assign(this.props, nextProps);
      }
      if (this.context) {
        Object.assign(this.context, nextContext);
      }
    });
  }

  componentDidUpdate() {
    if (isFunc(this.component.componentDidUpdate)) {
      this.component.componentDidUpdate();
    }
  }

  componentWillUnmount() {
    if (isFunc(this.component.componentWillUnmount)) {
      this.component.componentWillUnmount();
    }
    this.dispose();
  }

  setState(state, callback) {
    this.component.setState(state, callback);
  }

  render() {
    if (isFunc(this.component.render)) {
      if (this.renderAutorun === null) {
        this.renderAutorun = Autorun.start(comp => {
          this.element = this.component.render();
          if (!comp.isFirstRun) {
            Autorun.exclude(() => {
              this.delegate.forceUpdate();
            });
          }
        });
      }
    }
    return this.element;
  }

  dispose() {
    if (this.renderAutorun) {
      this.renderAutorun.dispose();
      this.renderAutorun = null;
    }
    if (this.computeAutorun) {
      this.computeAutorun.dispose();
      this.computeAutorun = null;
    }
    if (this.childContextAutorun) {
      this.childContextAutorun.dispose();
      this.childContextAutorun = null;
    }
    this.element = null;
    this.component = null;
    this.props = null;
    this.context = null;
    this.state = null;
  }
}
