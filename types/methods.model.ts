import type { TSJRPCInvokeData } from './model';

export type MethodsMethodsLike<ToolParam> = Record<string, (args: any | void, tool: ToolParam) => unknown>;

export type PRecord<Key extends string | number | symbol, Value> = Partial<Record<Key, Value>>;

export type MethodOptions<ToolParam = null> = {
  isNeedCheckClassName: boolean;
  send: (data: TSJRPCInvokeData, tool: ToolParam) => Promise<unknown>;
};

type ResultListeners<M extends MethodsMethodsLike<ToolParam>, ToolParam> = {
  [K in keyof M]?: {
    beforeSend?: (args: Parameters<M[K]>[0] extends void ? void : Parameters<M[K]>[0], tool: ToolParam) => void;
    onResponse?: (value: ReturnType<M[K]>) => void;
  };
};

export type MethodsConfig<M extends MethodsMethodsLike<ToolParam>, ToolParam> = {
  scope: string;
  methods: ResultListeners<M, ToolParam>;
};

export type MethodsPack<M extends MethodsMethodsLike<ToolParam>, ToolParam> = {
  [K in keyof M]: (
    args: Parameters<M[K]>[0] extends void ? void : Parameters<M[K]>[0],
    tool: ToolParam,
  ) => Promise<ReturnType<M[K]>>;
};
