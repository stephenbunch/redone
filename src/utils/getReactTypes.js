import React from 'react';
import { shape } from '../types';
import {
  ArraySchema,
  BooleanSchema,
  FunctionSchema,
  InstanceSchema,
  NullableSchema,
  NumberSchema,
  ObjectSchema,
  OptionalSchema,
  ShapeSchema,
  StringSchema,
} from '../schemas';

function transform(node) {
  if (node instanceof ArraySchema) {
    return React.PropTypes.arrayOf(transform(node.item));
  } else if (node instanceof BooleanSchema) {
    return React.PropTypes.bool;
  } else if (node instanceof FunctionSchema) {
    return React.PropTypes.func;
  } else if (node instanceof NumberSchema) {
    return React.PropTypes.number;
  } else if (node instanceof ObjectSchema) {
    return React.PropTypes.object;
  } else if (node instanceof ShapeSchema) {
    const keys = {};
    for (const key of Object.keys(node.keys)) {
      keys[key] = transform(node.keys[key]);
    }
    return React.PropTypes.shape(keys);
  } else if (node instanceof StringSchema) {
    return React.PropTypes.string;
  } else if (
    node instanceof NullableSchema ||
    node instanceof OptionalSchema
  ) {
    return transform(node.schema);
  } else if (node instanceof InstanceSchema) {
    return React.PropTypes.instanceOf(node.type);
  }
  return React.PropTypes.any;
}

export default function getReactTypes(spec) {
  const schema = shape(spec);
  const keys = {};
  for (const key of Object.keys(schema.keys)) {
    keys[key] = transform(schema.keys[key]);
  }
  return keys;
}
