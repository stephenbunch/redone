import SchemaParser from '../SchemaParser';
import ReactiveShapeSchema from '../schemas/ReactiveShapeSchema';
import transformReplaceShape from './transformReplaceShape';

const parser = new SchemaParser();

export default function createState(spec) {
  return transformReplaceShape(parser.parseShape(spec), ReactiveShapeSchema).cast();
}
