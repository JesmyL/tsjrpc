/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TSJRPCInvokeData } from '../types/model';

const registeredScopes = new Set<string>();

export const makeTSJRPCMethodsMaker = <ToolParam = null>(options: {
  isNeedCheckClassName: boolean;
  send: (data: TSJRPCInvokeData, tool: ToolParam) => Promise<unknown>;
}) => {
  const { isNeedCheckClassName, send } = options;

  type Methods = Record<string, (args: any | void, tool: ToolParam) => unknown>;

  type ResultListeners<M extends Methods> = {
    [K in keyof M]: true | ((value: ReturnType<M[K]>) => void);
  };

  type RegisteredMethods<M extends Methods> = {
    [K in keyof M]: (
      args: Parameters<M[K]>[0] extends void ? void : Parameters<M[K]>[0],
      tool: ToolParam,
    ) => Promise<ReturnType<M[K]>>;
  };

  type Config<M extends Methods> = {
    scope: string;
    methods: ResultListeners<M>;
  };
  type Maker = new <M extends Methods>(config: Config<M>) => RegisteredMethods<M>;

  return function (this: unknown, { scope, methods }: Config<Methods>) {
    const self = this as Methods;

    if (isNeedCheckClassName) {
      if (registeredScopes.has(scope)) throw new Error(`The invoker class ${scope} was created again`);
      registeredScopes.add(scope);
    }

    Object.keys(methods).forEach(method => {
      self[method] = (args: any, tool: ToolParam) => {
        const { promise, reject, resolve } = Promise.withResolvers();

        send({ scope, method, args }, tool).then(
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
  } as unknown as Maker;
};
