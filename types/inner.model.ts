export type TSJRPCEvent = {
  requestId: string;
  invokedResult?: unknown;
  invoke?: TSJRPCInvokeData;
  errorMessage?: string;
  abort?: string;
};

export type TSJRPCInvokeData = {
  scope: string;
  method: string;
  args: object;
  token?: string | null | undefined;
};

export type TSJRPCInvokeTranferDto<Tool = undefined> = {
  requestId: string;
  invoke: TSJRPCInvokeData;
  sendResponse: (event: TSJRPCEvent, tool: Tool) => void;
  tool: Tool;
};
