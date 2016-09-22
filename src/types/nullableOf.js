import SchemaParser from '../SchemaParser';
import NullableSchema from '../schemas/NullableSchema';

const parser = new SchemaParser();

export default function nullableOf(type) {
  return new NullableSchema(parser.parse(type));
}
