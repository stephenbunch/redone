import SchemaParser from '../SchemaParser';
import transformReplaceShape from '../utils/transformReplaceShape';
import ReactiveShapeSchema from '../schemas/ReactiveShapeSchema';
import ReadOnlyShapeSchema from '../schemas/ReadOnlyShapeSchema';

const parser = new SchemaParser();
const cache1 = new Map();
const cache2 = new Map();

export default function defaultSchemaFactory(Component) {
  const { propTypes, stateTypes, contextTypes } = Component;
  const propsShape = propTypes && parser.parseShape(propTypes);
  const stateShape = stateTypes && parser.parseShape({ value: stateTypes });
  const contextShape = contextTypes && parser.parseShape(contextTypes);
  const propsSchema = propsShape && transformReplaceShape(propsShape, ReactiveShapeSchema, cache1);
  const stateSchema = stateShape && transformReplaceShape(stateShape, ReactiveShapeSchema, cache1);
  const contextSchema = contextShape && transformReplaceShape(contextShape, ReactiveShapeSchema, cache1);
  const publicPropsSchema = propsShape && transformReplaceShape(propsShape, ReadOnlyShapeSchema, cache2);
  const publicContextSchema = contextShape && transformReplaceShape(contextShape, ReadOnlyShapeSchema, cache2);
  return {
    propsSchema,
    stateSchema,
    contextSchema,
    publicPropsSchema,
    publicContextSchema,
  };
}
