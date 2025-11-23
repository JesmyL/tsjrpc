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
    if (options.isNeedCheckClassName) {
      if (registeredScopes.has(scope)) throw new Error(`The invoker class ${scope} was created again`);
      registeredScopes.add(scope);
    }

    return new Proxy(
      {},
      {
        get: (_, method: string) => {
          return (args: any, tool: ToolParam) => {
            const { promise, reject, resolve } = Promise.withResolvers();

            methods[method]?.beforeSend?.(args, tool);

            options.send({ scope, method, args }, tool).then(value => {
              resolve(value);
              methods[method]?.onResponse?.(value);
            }, reject);

            return promise;
          };
        },
      },
    );
  } as never;
};
