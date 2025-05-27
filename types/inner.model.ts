import type { Atom } from 'atomaric';
import type { TSJRPCEvent, TSJRPCInvokeData, TSJRPCInvokeTranferDto } from './model';

export type MethodsLike = Record<string, (args: any | void) => unknown>;

export type PRecord<Key extends string | number | symbol, Value> = Partial<Record<Key, Value>>;

export type BeforeEaches<BeforeEachTool, Methods extends object> = Partial<{ [K in keyof Methods]: BeforeEachTool }>;

export type BaseOptions<ToolParam = undefined, FeedbackRet = void, BeforeEachTool = void> = {
  atom: Atom<TSJRPCInvokeTranferDto<TSJRPCEvent, ToolParam>>;
  feedbackOnEach?: (props: { onEachesRet: FeedbackRet; invoke: TSJRPCInvokeData; tool: ToolParam }) => void;
  onErrorMessage: (props: { errorMessage: string; invoke: TSJRPCInvokeData; tool: ToolParam }) => void;
  beforeEach?: (props: {
    invoke: TSJRPCInvokeData;
    tool: ToolParam;
    args: object | undefined;
    beforeEachTools?: BeforeEaches<BeforeEachTool, MethodsLike> | undefined;
    defaultBeforeEachTool?: BeforeEachTool | undefined;
  }) => Promise<{ isStopPropagation: boolean }>;
};

export type MethodOptions<ToolParam = null> = {
  isNeedCheckClassName: boolean;
  send: (data: TSJRPCInvokeData, tool: ToolParam) => Promise<unknown>;
};
