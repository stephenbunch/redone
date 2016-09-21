import { ShapeSchema } from '../schemas';

export default function transformReplaceShape(shape, Schema) {
  return (function transform(node) {
    if (node instanceof ShapeSchema) {
      const keys = {};
      for (const key of Object.keys(node.keys)) {
        keys[key] = transform(node.keys[key]);
      }
      return new Schema(keys);
    } else if (typeof node.transform === 'function') {
      return node.transform(transform);
    }
    return node;
  }(shape));
}
