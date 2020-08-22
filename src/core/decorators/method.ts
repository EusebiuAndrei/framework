import QueryHandler from '../@cqs/QueryHandler';
import { HTTPMethods } from '../@cqs/cqs';
import MutationHandler from '../@cqs/MutationHandler';
import { wow } from '.';

export function method(httpMethod: HTTPMethods) {
  const decorator = function (
    target: QueryHandler | MutationHandler,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<wow>,
  ) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const requests = this.queries || this.mutations;
      const queryDecorators = requests.get(propertyKey);
      requests.set(propertyKey, {
        ...queryDecorators,
        method: httpMethod,
      });
      return method.apply(this, args);
    };

    return descriptor;
  };
  return decorator;
}
