import provideMethod from './provideMethod';
import provideReactFacade from './provideReactFacade';

export default function provideFacade(Component) {
  provideReactFacade(Component);
  provideMethod(Component, 'dispose', function dispose() {
    if (this.component) {
      this.component.dispose();
      this.component = null;
    }
  });
  provideMethod(Component, 'getInstance', function getInstance() {
    if (this.component) {
      return this.component.getInstance();
    }
    return null;
  });
  provideMethod(Component, 'compute', function compute() {
    if (this.component) {
      return this.component.compute();
    }
    return null;
  });
}
