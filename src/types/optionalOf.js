import SchemaParser from '../SchemaParser';
import OptionalSchema from '../schemas/OptionalSchema';

const parser = new SchemaParser();

export default function optionalOf(type) {
  return new OptionalSchema(parser.parse(type));
}
