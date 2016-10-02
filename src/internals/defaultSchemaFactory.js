import SchemaParser from '../SchemaParser';
import transformReplaceShape from '../utils/transformReplaceShape';
import ReactiveShapeSchema from '../schemas/ReactiveShapeSchema';
import ReadOnlyShapeSchema from '../schemas/ReadOnlyShapeSchema';

const parser = new SchemaParser();

export default function defaultSchemaFactory(Component) {
  const { propTypes, stateTypes, contextTypes } = Component;
  const propsShape = propTypes && parser.parseShape(propTypes);
  const stateShape = stateTypes && parser.parseShape({ value: stateTypes });
  const contextShape = contextTypes && parser.parseShape(contextTypes);
  const propsSchema = propsShape && transformReplaceShape(propsShape, ReactiveShapeSchema);
  const stateSchema = stateShape && transformReplaceShape(stateShape, ReactiveShapeSchema);
  const contextSchema = contextShape && transformReplaceShape(contextShape, ReactiveShapeSchema);
  const publicPropsSchema = propsShape && transformReplaceShape(propsShape, ReadOnlyShapeSchema);
  const publicContextSchema = contextShape && transformReplaceShape(contextShape, ReadOnlyShapeSchema);
  return {
    propsSchema,
    stateSchema,
    contextSchema,
    publicPropsSchema,
    publicContextSchema,
  };
}
