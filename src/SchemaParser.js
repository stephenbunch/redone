import AnySchema from './schemas/AnySchema';
import ArraySchema from './schemas/ArraySchema';
import ShapeSchema from './schemas/ShapeSchema';

const defaultList = schema => new ArraySchema(schema);
const defaultShape = keys => new ShapeSchema(keys);

/**
 * @typedef {Object} SchemaParserOptions
 * @property {function(item: Schema): Schema} list
 * @property {function(keys: Object.<string, Schema>): Schema} shape
 */

export default class SchemaParser {
  /**
   * @param {SchemaParserOptions} options
   */
  constructor({ list = defaultList, shape = defaultShape } = {}) {
    this.list = list;
    this.shape = shape;
  }

  parse(value) {
    if (value instanceof AnySchema) {
      return value;
    } else if (Array.isArray(value)) {
      return this.list(this.parse(value[0] || new AnySchema()));
    } else if (typeof value === 'object' && value !== null) {
      const keys = {};
      for (const key of Object.keys(value)) {
        keys[key] = this.parse(value[key]);
      }
      return this.shape(keys);
    }
    throw new Error(`Could not parse schema value '${JSON.stringify(value)}'.`);
  }
}
