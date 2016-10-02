export default function setClassName(Class, name) {
  Object.defineProperty(Class, 'name', {
    value: name,
    configurable: true,
  });
}
