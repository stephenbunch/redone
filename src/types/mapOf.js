import SchemaParser from '../SchemaParser';
import ReactiveMapSchema from '../schemas/ReactiveMapSchema';

const parser = new SchemaParser();

export default function mapOf(key, value) {
  return new ReactiveMapSchema(parser.parse(key), parser.parse(value));
}
