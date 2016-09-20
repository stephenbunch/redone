import * as schemas from './schemas';
import SchemaParser from './SchemaParser';

const parser = new SchemaParser();

export const any = new schemas.AnySchema();
export const bool = new schemas.BooleanSchema();
export const date = new schemas.DateSchema();
export const func = new schemas.FunctionSchema();
export const number = new schemas.NumberSchema();
export const object = new schemas.ObjectSchema();
export const string = new schemas.StringSchema();

export function shape(spec) {
  return parser.parse(spec);
}

export function listOf(type) {
  return new schemas.ArraySchema(parser.parse(type));
}

export function optionalOf(type) {
  return new schemas.OptionalSchema(parser.parse(type));
}

export function nullableOf(type) {
  return new schemas.NullableSchema(parser.parse(type));
}

export function reactiveShape(spec) {
  return (function transform(node) {
    if (node instanceof schemas.ShapeSchema) {
      const keys = {};
      for (const key of Object.keys(node.keys)) {
        keys[key] = transform(node.keys[key]);
      }
      return new schemas.ReactiveShapeSchema(keys);
    } else if (typeof node.transform === 'function') {
      return node.transform(transform);
    }
    return node;
  }(shape(spec)));
}
