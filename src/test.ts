import { makeTSJRPCBaseMaker } from './base.maker';
import { makeTSJRPCMethodsMaker } from './methods.maker';

const { maker: Base } = makeTSJRPCBaseMaker<{ ret: `${333}` }, { dadad: 123 }, {}>({
  onErrorMessage: () => {},
  beforeEach: async () => ({ isStopPropagation: false }),
  feedbackOnEach: () => {},
});

const Methods = makeTSJRPCMethodsMaker({
  isNeedCheckClassName: false,
  send: async () => {},
});

type Methods = {
  add(args: { qwe: 333 }): 123;
};

const methods = new (class A extends Methods<Methods> {
  constructor() {
    super({
      scope: 'Scope',
      methods: {
        add: async eqeq => eqeq,
      },
    });
  }
})();

const base = new (class A extends Base<Methods> {
  constructor() {
    super({
      scope: '',
      methods: {
        add: async ({ qwe }, { dadad }) => ({ ret: `${qwe}`, value: dadad }),
      },
    });
  }
})();

methods.add({ qwe: 333 }, null);
base.$$register();
base.add({ qwe: 333 }, { dadad: 123 });
