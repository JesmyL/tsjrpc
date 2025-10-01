import type { BaseMakerConfig, BaseMethodsLike, BaseOptions, MethodCallbacks, PRecord } from '../types/base.model';
import type { makeTSJRPCBaseMaker as makeTSJRPCBaseMakerFunc } from '../types/model';

export const makeTSJRPCBaseMaker: typeof makeTSJRPCBaseMakerFunc = <
  WithValueRet extends object | void,
  ToolParam = undefined,
  BeforeEachTool = void,
>(
  options: BaseOptions<WithValueRet, ToolParam, BeforeEachTool>,
) => {
  const { beforeEach, feedbackOnEach, onErrorMessage } = options;

  const registeredMethods: PRecord<string, MethodCallbacks<WithValueRet, BaseMethodsLike, ToolParam>> = {};
  const unregisteredWaiters: PRecord<string, () => void> = {};

  return {
    maker: function (
      this: unknown,
      options: BaseMakerConfig<WithValueRet, BaseMethodsLike, ToolParam, BeforeEachTool>,
    ) {
      const { scope, methods, beforeEachTools, defaultBeforeEachTool } = options;
      const self = this as BaseMethodsLike;

      Object.keys(methods).forEach(method => {
        if (beforeEach === undefined) self[method] = methods[method] as never;
        else
          self[method] = (async (
            args: Parameters<(typeof methods)[typeof method]>[0],
            tool: Parameters<(typeof methods)[typeof method]>[1],
          ) => {
            if (
              !(
                await beforeEach({
                  invoke: { method, scope, args },
                  tool,
                  args,
                  beforeEachTools,
                  defaultBeforeEachTool,
                })
              ).isStopPropagation
            )
              return methods[method](args, tool);
          }) as never;
      });

      self.$$register = (() => {
        if (registeredMethods[scope] !== undefined) {
          console.warn(`the ${scope} is registered more then 1 times`);
        }

        registeredMethods[scope] = self as never;

        unregisteredWaiters[scope]?.();
      }) as never;

      return this;
    } as never,
    next: async ({ invoke: { scope, method, args }, invoke, sendResponse, tool, requestId }) => {
      const invokeMethod = async () => {
        try {
          if (beforeEach !== undefined && (await beforeEach({ invoke, args, tool: tool as never })).isStopPropagation)
            return;

          if (registeredMethods[scope] === undefined) {
            throw new Error(`the scope ${scope} is not registered - ${method}()`);
          }

          if (typeof registeredMethods[scope][method] !== 'function')
            throw new Error(`the ${scope} has no the ${method} method`);

          const feedback = await registeredMethods[scope][method](args, tool as never);

          feedbackOnEach?.({ invoke, tool: tool as never, feedback: feedback as never });
          sendResponse({ invokedResult: feedback, requestId }, tool);
        } catch (error) {
          sendResponse({ errorMessage: '' + error, requestId }, tool);
          onErrorMessage({ errorMessage: '' + error, invoke, tool: tool as never });
        }
      };

      if (registeredMethods[scope] === undefined) {
        console.warn(`${scope}.${method}() will invoke with delay`);

        unregisteredWaiters[scope] = () => {
          console.warn(`${scope}.${method}() invoked with delay`);
          invokeMethod();
        };

        setTimeout(() => {
          delete unregisteredWaiters[scope];
          invokeMethod();
        }, 10_000);

        return;
      }

      invokeMethod();
    },
  };
};
