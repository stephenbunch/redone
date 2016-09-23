export default function toJson(obj, keys) {
  const retval = {};
  for (const key of keys) {
    let value = obj[key];
    if (
      typeof value === 'object' &&
      value !== null &&
      typeof value.toJSON === 'function'
    ) {
      value = value.toJSON();
    }
    if (value !== undefined) {
      retval[key] = value;
    }
  }
  return retval;
}
