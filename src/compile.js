import setClassName from './internals/setClassName';
import createProxy from './internals/createProxy';
import defaultSchemaFactory from './internals/defaultSchemaFactory';

const hot = {};

function createClass(Component, Proxy, name, statics, moduleId) {
  class ReactComponent extends Component {

    constructor(props) {
      super(props);
      if (hot[moduleId]) {
        hot[moduleId].instances.push(this);
      }
      this.component = new Proxy(props, this);
      this.component.compute();
    }

    get state() {
      const instance = this.component.instance();
      if (instance) {
        return instance.state;
      }
      return null;
    }

    set state(nextState) {
      const instance = this.component.instance();
      if (instance) {
        instance.state = nextState;
      }
    }

    componentWillMount() {
      this.component.componentWillMount();
    }

    componentDidMount() {
      this.component.componentDidMount();
    }

    componentWillReceiveProps(nextProps) {
      this.component.componentWillReceiveProps(nextProps);
    }

    shouldComponentUpdate() {
      return false;
    }

    componentDidUpdate() {
      this.component.componentDidUpdate();
    }

    componentWillUnmount() {
      this.component.componentWillUnmount();
      this.component.dispose();
      if (hot[moduleId]) {
        hot[moduleId].instances.splice(hot[moduleId].instances.indexOf(this), 1);
      }
    }

    setState(nextState, callback) {
      this.component.setState(nextState, callback);
    }

    reload(Component) {
      this.component.componentWillUnmount();
      this.component.dispose();
      this.component = new Component(this.props, this);
      this.component.compute();
      this.forceUpdate();
    }

    render() {
      return this.component.render();
    }
  }

  setClassName(ReactComponent, name);
  Object.assign(ReactComponent, statics);
  return ReactComponent;
}

function compile(Component, module, schemaFactory, Class) {
  if (typeof Class !== 'function') {
    throw new Error('Class must be a class.');
  }

  const { ...statics } = Class;
  delete statics.propTypes;
  delete statics.stateTypes;

  const Proxy = createProxy(Class, schemaFactory);

  if (module && module.hot) {
    module.hot.accept();
    if (!hot[module.id]) {
      hot[module.id] = {
        Class: createClass(Component, Proxy, Class.name, statics, module.id),
        instances: [],
      };
    } else {
      hot[module.id].instances.forEach(x => x.reload(Proxy));
    }
    return hot[module.id].Class;
  }
  return createClass(Component, Proxy, Class.name, statics);
}

export default function decorator(Component, module = null, schemaFactory = defaultSchemaFactory) {
  return compile.bind(undefined, Component, module, schemaFactory);
}
