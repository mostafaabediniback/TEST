import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

// Exercise the store and interceptor callbacks without a browser or HTTP server.
function setup(pathname = "/") {
  const messages = [];
  const handlers = {};
  const context = vm.createContext({
    window: { location: { pathname } },
    sessionStorage: { getItem: () => null },
    useSyncExternalStore: () => {},
    toast: { error: (message) => messages.push(message) },
    axios: {
      isCancel: (error) => error.code === "ERR_CANCELED",
      create: () => ({
        interceptors: {
          request: { use: (handler) => { handlers.request = handler; } },
          response: { use: (success, error) => { handlers.success = success; handlers.error = error; } },
        },
      }),
    },
  });
  const store = readFileSync(new URL("../src/store/useLoadingStore.js", import.meta.url), "utf8")
    .replace(/^import .*;$/gm, "")
    .replace("export default useLoadingStore;", "");
  vm.runInContext(store, context);
  const interceptors = readFileSync(new URL("../src/utils/axiosInstance.js", import.meta.url), "utf8")
    .replace(/^import .*;$/gm, "")
    .replace("import.meta.env.VITE_API_BASE_URL", "undefined")
    .replace("export default axiosInstance;", "");
  vm.runInContext(interceptors, context);
  return {
    ...handlers,
    messages,
    location: context.window.location,
    count: () => vm.runInContext("useLoadingStore.getState().loadingCount", context),
    config: () => ({ headers: {} }),
  };
}

test("overlapping requests stay counted when another starts after a completion", () => {
  const app = setup();
  const first = app.request(app.config());
  const second = app.request(app.config());
  assert.equal(app.count(), 2);
  app.success({ config: first });
  const third = app.request(app.config());
  app.success({ config: second });
  assert.equal(app.count(), 1);
  app.success({ config: third });
  assert.equal(app.count(), 0);
  app.success({ config: third });
  assert.equal(app.count(), 0);
});

test("map and map trailing slash skip loading, unrelated routes still count", () => {
  for (const path of ["/map", "/map/", "/map/details"]) {
    const app = setup(path);
    const request = app.request(app.config());
    assert.equal(app.count(), 0);
    app.location.pathname = "/settings";
    app.success({ config: request });
    assert.equal(app.count(), 0);
  }
  const app = setup("/mapping");
  app.request(app.config());
  assert.equal(app.count(), 1);
});

test("completion retains original loading decision after navigation to map", () => {
  const app = setup();
  const request = app.request(app.config());
  app.location.pathname = "/map";
  app.success({ config: request });
  assert.equal(app.count(), 0);
});

test("explicit map request opt-out does not decrement another pending request", () => {
  const app = setup();
  const normal = app.request(app.config());
  const map = app.request({ ...app.config(), skipGlobalLoading: true });
  app.success({ config: map });
  assert.equal(app.count(), 1);
  app.success({ config: normal });
  assert.equal(app.count(), 0);
});

test("400 response bodies preserve the original error and clear loading", async () => {
  for (const data of [null, "Invalid", { title: "Invalid", status: 400 }, { errors: { name: ["Required"], age: "Invalid" } }]) {
    const app = setup();
    const config = app.request(app.config());
    const error = { config, response: { status: 400, data } };
    await assert.rejects(app.error(error), (received) => received === error);
    assert.equal(app.count(), 0);
    assert.ok(app.messages.length > 0);
  }
});

test("cancellation balances loading without showing an error toast", async () => {
  const app = setup();
  const config = app.request(app.config());
  const error = { config, code: "ERR_CANCELED" };
  await assert.rejects(app.error(error), (received) => received === error);
  assert.equal(app.count(), 0);
  assert.equal(app.messages.length, 0);
});

test("network failure clears loading and preserves the error", async () => {
  const app = setup();
  const config = app.request(app.config());
  const error = { config };
  await assert.rejects(app.error(error), (received) => received === error);
  assert.equal(app.count(), 0);
  assert.equal(app.messages.length, 1);
});
