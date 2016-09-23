import SchemaParser from '../SchemaParser';
import GenericFunctionSchema from '../schemas/GenericFunctionSchema';

const parser = new SchemaParser();

export default function funcOf(type) {
  return new GenericFunctionSchema(parser.parse(type));
}
