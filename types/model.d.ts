import type { BaseOptions, MethodsLike } from './model';

export type TSJRPCInvokeData = {
  scope: string;
  method: string;
  args: object;
  token?: string | nil;
};

export type TSJRPCInvokeTranferDto<Event extends TSJRPCEvent, Tool = undefined> = {
  requestId: string;
  invoke: TSJRPCInvokeData;
  sendResponse: (event: Event, tool: Tool) => void;
  tool: Tool;
};

export type TSJRPCEvent = {
  requestId: string;
  invokedResult?: unknown;
  invoke?: TSJRPCInvokeData;
  errorMessage?: string;
  abort?: string;
};

declare function makeTSJRPCBaseMaker<ToolParam = undefined, FeedbackRet = void, BeforeEachTool = void>(
  options: BaseOptions<ToolParam, FeedbackRet, BeforeEachTool>,
): new <M extends MethodsLike>(config: Config<M>) => Methods<M> & { $$register: () => void };

declare type makeTSJRPCMethodsMaker = makeTSJRPCMethodsMakerFunc;
