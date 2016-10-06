import Autorun from '../Autorun';

function isFunc(prop) {
  return typeof prop === 'function';
}

function setState(state, callback) {
  Autorun.once(() => Object.assign(this.state, state));
  if (callback) {
    callback();
  }
}

export function createProxy(Component, schemaFactory) {
  const {
    propsSchema,
    stateSchema,
    contextSchema,
    publicPropsSchema,
    publicContextSchema,
  } = schemaFactory(Component);

  class ReactiveComponent {
    constructor(props, context, delegate) {
      this._delegate = delegate;

      this._props = propsSchema ? propsSchema.cast(props) : null;
      this._context = contextSchema ? contextSchema.cast(context) : null;
      this._state = stateSchema ? stateSchema.cast() : null;

      this._component = Object.create(Component.prototype);
      Object.defineProperty(this._component, 'props', {
        value: propsSchema ? publicPropsSchema.cast(this._props) : null,
      });
      Object.defineProperty(this._component, 'context', {
        value: contextSchema ? publicContextSchema.cast(this._context) : null,
      });
      Object.defineProperty(this._component, 'state', {
        get: () => this._state && this._state.value,
        set: nextState => {
          if (this._state === null) {
            if (nextState === null) {
              return;
            }
            throw new Error('State types must be specified to use the state.');
          }
          this._state.value = nextState;
        },
      });
      Object.defineProperty(this._component, 'setState', {
        value: setState,
      });
      Component.call(this._component, this._component.props, this._component.context);

      this._renderAutorun = null;
      this._element = null;
      this._childContextAutorun = null;
      this._childContext = null;
      this._computeAutorun = null;
    }

    instance() {
      return this._component;
    }

    compute() {
      if (isFunc(this._component.compute)) {
        if (this._computeAutorun === null) {
          this._computeAutorun = Autorun.start(comp =>
            this._component.compute(comp)
          );
        }
        return this._computeAutorun.value;
      }
      return undefined;
    }

    getChildContext() {
      if (isFunc(this._component.getChildContext)) {
        this._childContextAutorun = Autorun.start(comp => {
          this._childContext = this._component.getChildContext();
          if (!comp.isFirstRun) {
            Autorun.exclude(() => {
              this._delegate.forceUpdate();
            });
          }
        });
      }
      return this._childContext;
    }

    componentWillMount() {
      if (isFunc(this._component.componentWillMount)) {
        this._component.componentWillMount();
      }
    }

    componentDidMount() {
      if (isFunc(this._component.componentDidMount)) {
        this._component.componentDidMount();
      }
    }

    componentWillReceiveProps(nextProps, nextContext) {
      Autorun.once(() => {
        if (this._props) {
          Object.assign(this._props, nextProps);
        }
        if (this._context) {
          Object.assign(this._context, nextContext);
        }
      });
    }

    componentDidUpdate() {
      if (isFunc(this._component.componentDidUpdate)) {
        this._component.componentDidUpdate();
      }
    }

    componentWillUnmount() {
      if (isFunc(this._component.componentWillUnmount)) {
        this._component.componentWillUnmount();
      }
    }

    setState(state, callback) {
      this._component.setState(state, callback);
    }

    render() {
      if (isFunc(this._component.render)) {
        if (this._renderAutorun === null) {
          this._renderAutorun = Autorun.start(comp => {
            let element = this._component.render();
            if (element === undefined) {
              element = null;
            }
            if (element !== this._element) {
              this._element = element;
              if (!comp.isFirstRun) {
                Autorun.exclude(() => {
                  this._delegate.forceUpdate();
                });
              }
            }
          });
        }
      }
      return this._element;
    }

    dispose() {
      if (isFunc(this._component.dispose)) {
        this._component.dispose();
      }
      if (this._renderAutorun) {
        this._renderAutorun.dispose();
        this._renderAutorun = null;
      }
      if (this._computeAutorun) {
        this._computeAutorun.dispose();
        this._computeAutorun = null;
      }
      if (this._childContextAutorun) {
        this._childContextAutorun.dispose();
        this._childContextAutorun = null;
      }
      this._element = null;
      this._component = null;
      this._props = null;
      this._context = null;
      this._state = null;
    }
  }

  return {
    Component: ReactiveComponent,
  };
}
