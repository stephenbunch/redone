export default function toObject(obj, keys) {
  const retval = {};
  for (const key of Object.keys(keys)) {
    let value = obj[key];
    if (
      typeof value === 'object' &&
      value !== null &&
      typeof value.toObject === 'function'
    ) {
      value = value.toObject();
    }
    if (value !== undefined) {
      retval[key] = value;
    }
  }
  return retval;
}
