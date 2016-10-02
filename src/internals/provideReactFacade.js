import provideMethod from './provideMethod';

export default function provideReactFacade(Class) {
  provideMethod(Class, 'getChildContext', function getChildContext() {
    if (this.component) {
      return this.component.getChildContext();
    }
    return null;
  });
  provideMethod(Class, 'componentWillMount', function componentWillMount() {
    if (this.component) {
      this.component.componentWillMount();
    }
  });
  provideMethod(Class, 'componentDidMount', function componentDidMount() {
    if (this.component) {
      this.component.componentDidMount();
    }
  });
  provideMethod(Class, 'componentWillReceiveProps', function componentWillReceiveProps(nextProps, nextContext) {
    if (this.component) {
      this.component.componentWillReceiveProps(nextProps, nextContext);
    }
  });
  provideMethod(Class, 'componentDidUpdate', function componentDidUpdate() {
    if (this.component) {
      this.component.componentDidUpdate();
    }
  });
  provideMethod(Class, 'componentWillUnmount', function componentWillUnmount() {
    if (this.component) {
      this.component.componentWillUnmount();
    }
  });
  provideMethod(Class, 'setState', function setState(state, callback) {
    if (this.component) {
      this.component.setState(state, callback);
    }
  });
  provideMethod(Class, 'render', function render() {
    if (this.component) {
      return this.component.render();
    }
    return null;
  });
}
