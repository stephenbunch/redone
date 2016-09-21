import * as schemas from './schemas';
import SchemaParser from './SchemaParser';
import transformReplaceShape from './utils/transformReplaceShape';

const parser = new SchemaParser();

export const any = new schemas.AnySchema();
export const bool = new schemas.BooleanSchema();
export const date = new schemas.DateSchema();
export const func = new schemas.FunctionSchema();
export const number = new schemas.NumberSchema();
export const object = new schemas.ObjectSchema();
export const string = new schemas.StringSchema();

export function shape(spec) {
  return parser.parseShape(spec);
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
  return transformReplaceShape(shape(spec), schemas.ReactiveShapeSchema);
}

export function readOnlyShape(spec) {
  return transformReplaceShape(shape(spec), schemas.ReadOnlyShapeSchema);
}

export function instanceOf(type) {
  return new schemas.InstanceSchema(type);
}
