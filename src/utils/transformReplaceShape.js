import { ShapeSchema } from '../schemas';

export default function transformReplaceShape(shape, Schema, cache = null) {
  return (function transform(node) {
    if (node instanceof ShapeSchema) {
      const keys = {};
      for (const key of Object.keys(node.keys)) {
        keys[key] = transform(node.keys[key]);
      }
      if (cache) {
        if (!cache.has(node)) {
          cache.set(node, new Schema(keys));
        }
        return cache.get(node);
      }
      return new Schema(keys);
    } else if (typeof node.transform === 'function') {
      return node.transform(transform);
    }
    return node;
  }(shape));
}
