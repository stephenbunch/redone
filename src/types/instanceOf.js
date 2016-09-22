import InstanceSchema from '../schemas/InstanceSchema';

export default function instanceOf(type) {
  return new InstanceSchema(type);
}
