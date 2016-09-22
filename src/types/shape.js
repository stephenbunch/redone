import SchemaParser from '../SchemaParser';

const parser = new SchemaParser();

export default function shape(spec) {
  return parser.parseShape(spec);
}
