// eslint-disable-next-line @typescript-eslint/no-explicit-any

import type { BaseOptions, BeforeEaches, MethodsLike, PRecord } from '../types/inner.model';
import type { makeTSJRPCBaseMaker as makeTSJRPCBaseMakerFunc } from '../types/model';

type OnEachFeedbackInvocations<M extends MethodsLike, FeedbackRet> = {
  [K in keyof M]: ((args: Parameters<M[K]>[0], value: ReturnType<M[K]>) => FeedbackRet) | null;
};

export const makeTSJRPCBaseMaker: typeof makeTSJRPCBaseMakerFunc = <
  ToolParam = undefined,
  FeedbackRet = void,
  BeforeEachTool = void,
>(
  options: BaseOptions<ToolParam, FeedbackRet, BeforeEachTool>,
) => {
  const { beforeEach, feedbackOnEach, onErrorMessage } = options;

  type Methods<M extends MethodsLike> = {
    [K in keyof M]: (args: Parameters<M[K]>[0], tool: ToolParam) => Promise<ReturnType<M[K]>> | ReturnType<M[K]>;
  };

  const registeredMethods: PRecord<string, Methods<MethodsLike>> = {};
  const registeredOnEachFeedbacks: PRecord<string, OnEachFeedbackInvocations<MethodsLike, FeedbackRet> | null> = {};
  const unregisteredWaiters: PRecord<string, () => void> = {};

  type Config<M extends MethodsLike> = {
    scope: string;
    methods: Methods<M>;
    onEachFeedback?: OnEachFeedbackInvocations<M, FeedbackRet>;
    beforeEachTools?: BeforeEaches<BeforeEachTool, M>;
    defaultBeforeEachTool?: BeforeEachTool;
  };

  type Maker = new <M extends MethodsLike>(config: Config<M>) => Methods<M> & { $$register: () => void };

  options.atom.subscribe(async ({ invoke: { scope, method, args }, invoke, sendResponse, tool, requestId }) => {
    const invokeMethod = async () => {
      try {
        if (beforeEach !== undefined && (await beforeEach({ invoke, args, tool })).isStopPropagation) return;

        if (registeredMethods[scope] === undefined) {
          throw new Error(`the scope ${scope} is not registered - ${method}()`);
        }

        if (typeof registeredMethods[scope][method] !== 'function')
          throw new Error(`the ${scope} has no the ${method} method`);

        const invokedResult = await registeredMethods[scope][method](args, tool);

        if (
          feedbackOnEach !== undefined &&
          registeredOnEachFeedbacks[scope] != null &&
          registeredOnEachFeedbacks[scope][method] != null
        ) {
          const onEachesRet = registeredOnEachFeedbacks[scope][method](args, invokedResult);

          feedbackOnEach({ onEachesRet, invoke, tool });
        }

        sendResponse({ invokedResult, requestId }, tool);
      } catch (error) {
        sendResponse({ errorMessage: '' + error, requestId }, tool);
        onErrorMessage({ errorMessage: '' + error, invoke, tool });
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
  });

  return function (this: unknown, options: Config<MethodsLike>) {
    const { scope, methods, beforeEachTools, onEachFeedback, defaultBeforeEachTool } = options;
    const self = this as MethodsLike;

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
      registeredOnEachFeedbacks[scope] = onEachFeedback;

      unregisteredWaiters[scope]?.();
    }) as never;

    return this;
  } as unknown as Maker;
};
