export default function toJson(obj, keys) {
  const retval = {};
  for (const key of Object.keys(keys)) {
    let value = obj[key];
    if (typeof value === 'object' && value !== null) {
      if (typeof value.toJSON === 'function') {
        value = value.toJSON();
      } else if (typeof value.toObject === 'function') {
        value = value.toObject();
      }
    }
    if (value !== undefined) {
      retval[key] = value;
    }
  }
  return retval;
}
