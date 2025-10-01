import type { TSJRPCInvokeData } from './model';

export type BaseMethodsLike = Record<string, (args: any | void) => unknown>;

export type PRecord<Key extends string | number | symbol, Value> = Partial<Record<Key, Value>>;

export type BeforeEaches<BeforeEachTool, Methods extends object> = Partial<{ [K in keyof Methods]: BeforeEachTool }>;

export type BaseOptions<WithValueRet extends object | void, ToolParam = undefined, BeforeEachTool = void> = {
  feedbackOnEach?: (props: { feedback: WithValueRet; invoke: TSJRPCInvokeData; tool: ToolParam }) => void;
  onErrorMessage: (props: { errorMessage: string; invoke: TSJRPCInvokeData; tool: ToolParam }) => void;
  beforeEach?: (props: {
    invoke: TSJRPCInvokeData;
    tool: ToolParam;
    args: object | undefined;
    beforeEachTools?: BeforeEaches<BeforeEachTool, BaseMethodsLike> | undefined;
    defaultBeforeEachTool?: BeforeEachTool | undefined;
  }) => Promise<{ isStopPropagation: boolean }>;
};

export type MethodCallbacks<WithValueRet extends object | void, M extends BaseMethodsLike, ToolParam> = {
  [K in keyof M]: (
    args: Parameters<M[K]>[0],
    tool: ToolParam,
  ) => WithValueRet extends void
    ? Promise<ReturnType<M[K]>>
    :
        | Promise<ReturnType<M[K]> extends void ? void | WithValueRet : { value: ReturnType<M[K]> } & WithValueRet>
        | (ReturnType<M[K]> extends void ? void | WithValueRet : { value: ReturnType<M[K]> } & WithValueRet);
};

export type BaseMakerConfig<
  WithValueRet extends object | void,
  M extends BaseMethodsLike,
  ToolParam,
  BeforeEachTool,
> = {
  scope: string;
  methods: MethodCallbacks<WithValueRet, M, ToolParam>;
  beforeEachTools?: BeforeEaches<BeforeEachTool, M>;
  defaultBeforeEachTool?: BeforeEachTool;
};
