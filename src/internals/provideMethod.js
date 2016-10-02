export default function provideMethod(Class, name, func) {
  if (!Object.prototype.hasOwnProperty.call(Class.prototype, name)) {
    Object.defineProperty(Class.prototype, name, {
      configurable: true,
      writable: true,
      value: func,
    });
  }
}
