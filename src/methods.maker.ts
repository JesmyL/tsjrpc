/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TSJRPCInvokeData } from '../types/inner.model';
import type { MethodsConfig, MethodsMethodsLike } from '../types/methods.model';
import type { makeTSJRPCMethodsMaker as makeTSJRPCMethodsMakerFunc } from '../types/model';

const registeredScopes = new Set<string>();

export const makeTSJRPCMethodsMaker: typeof makeTSJRPCMethodsMakerFunc = <ToolParam = null>(options: {
  isNeedCheckClassName: boolean;
  send: (data: TSJRPCInvokeData, tool: ToolParam) => Promise<unknown>;
}) => {
  return function (this: unknown, { scope, methods }: MethodsConfig<MethodsMethodsLike<ToolParam>, ToolParam>) {
    const self = this as MethodsMethodsLike<ToolParam>;

    if (options.isNeedCheckClassName) {
      if (registeredScopes.has(scope)) throw new Error(`The invoker class ${scope} was created again`);
      registeredScopes.add(scope);
    }

    Object.keys(methods).forEach(method => {
      self[method] = (args: any, tool: ToolParam) => {
        const { promise, reject, resolve } = Promise.withResolvers();

        options.send({ scope, method, args }, tool).then(
          methods[method] === true
            ? resolve
            : value => {
                resolve(value);
                (methods[method] as (value: unknown) => void)(value);
              },
          reject,
        );

        return promise;
      };
    });

    return this;
  } as never;
};
