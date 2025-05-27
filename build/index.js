const d = (u) => {
  const { beforeEach: w, feedbackOnEach: E, onErrorMessage: l } = u, i = {}, k = {}, s = {};
  return u.atom.subscribe(async ({ invoke: { scope: e, method: r, args: a }, invoke: c, sendResponse: f, tool: t, requestId: h }) => {
    const n = async () => {
      try {
        if (w !== void 0 && (await w({ invoke: c, args: a, tool: t })).isStopPropagation) return;
        if (i[e] === void 0)
          throw new Error(`the scope ${e} is not registered - ${r}()`);
        if (typeof i[e][r] != "function")
          throw new Error(`the ${e} has no the ${r} method`);
        const o = await i[e][r](a, t);
        if (E !== void 0 && k[e] != null && k[e][r] != null) {
          const v = k[e][r](a, o);
          E({ onEachesRet: v, invoke: c, tool: t });
        }
        f({ invokedResult: o, requestId: h }, t);
      } catch (o) {
        f({ errorMessage: "" + o, requestId: h }, t), l({ errorMessage: "" + o, invoke: c, tool: t });
      }
    };
    if (i[e] === void 0) {
      console.warn(`${e}.${r}() will invoke with delay`), s[e] = () => {
        console.warn(`${e}.${r}() invoked with delay`), n();
      }, setTimeout(() => {
        delete s[e], n();
      }, 1e4);
      return;
    }
    n();
  }), function(e) {
    const { scope: r, methods: a, beforeEachTools: c, onEachFeedback: f, defaultBeforeEachTool: t } = e, h = this;
    return Object.keys(a).forEach((n) => {
      w === void 0 ? h[n] = a[n] : h[n] = async (o, v) => {
        if (!(await w({
          invoke: { method: n, scope: r, args: o },
          tool: v,
          args: o,
          beforeEachTools: c,
          defaultBeforeEachTool: t
        })).isStopPropagation)
          return a[n](o, v);
      };
    }), h.$$register = () => {
      var n;
      i[r] !== void 0 && console.warn(`the ${r} is registered more then 1 times`), i[r] = h, k[r] = f, (n = s[r]) == null || n.call(s);
    }, this;
  };
}, $ = /* @__PURE__ */ new Set(), b = (u) => {
  const { isNeedCheckClassName: w, send: E } = u;
  return function({ scope: l, methods: i }) {
    const k = this;
    if (w) {
      if ($.has(l)) throw new Error(`The invoker class ${l} was created again`);
      $.add(l);
    }
    return Object.keys(i).forEach((s) => {
      k[s] = (e, r) => {
        const { promise: a, reject: c, resolve: f } = Promise.withResolvers();
        return E({ scope: l, method: s, args: e }, r).then(
          i[s] === !0 ? f : (t) => {
            f(t), i[s](t);
          },
          c
        ), a;
      };
    }), this;
  };
};
export {
  d as makeTSJRPCBaseMaker,
  b as makeTSJRPCMethodsMaker
};
