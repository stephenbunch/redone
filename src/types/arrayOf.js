import SchemaParser from '../SchemaParser';
import ArraySchema from '../schemas/ArraySchema';

const parser = new SchemaParser();

export default function arrayOf(type) {
  return new ArraySchema(parser.parse(type));
}
