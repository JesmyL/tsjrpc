import type { BaseMakerConfig, BaseMethodsLike, BaseOptions, MethodCallbacks } from './base.model';
import type { TSJRPCInvokeTranferDto } from './inner.model';
import type { MethodOptions, MethodsConfig, MethodsMethodsLike, MethodsPack } from './methods.model';

declare function makeTSJRPCBaseMaker<WithValueRet extends object | void, ToolParam = undefined, BeforeEachTool = void>(
  options: BaseOptions<WithValueRet, ToolParam, BeforeEachTool>,
): {
  maker: new <M extends BaseMethodsLike>(
    config: BaseMakerConfig<WithValueRet, M, ToolParam, BeforeEachTool>,
  ) => MethodCallbacks<WithValueRet, M, ToolParam> & {
    $$register: () => void;
  };
  next: (options: TSJRPCInvokeTranferDto<ToolParam>) => void;
};

declare function makeTSJRPCMethodsMaker<ToolParam = null>(
  options: MethodOptions<ToolParam>,
): new <M extends MethodsMethodsLike<ToolParam>>(config: MethodsConfig<M, ToolParam>) => MethodsPack<M, ToolParam>;

export * from './inner.model';
export { makeTSJRPCBaseMaker, makeTSJRPCMethodsMaker };
