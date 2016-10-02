import setClassName from './setClassName';

export default function extendClass(Class, statics) {
  const Ext = class extends Class {};
  Object.assign(Ext, statics);
  setClassName(Ext, Class.name);
  return Ext;
}
