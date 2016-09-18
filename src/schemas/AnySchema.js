/**
 * @typedef Schema
 * @property {function()} cast
 */

/**
 * @implements Schema
 */
export default class AnySchema {
  cast(value) {
    return value;
  }
}
