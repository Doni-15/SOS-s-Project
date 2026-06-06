import { AsyncLocalStorage } from "node:async_hooks";

const requestContextStorage = new AsyncLocalStorage();

export const runWithRequestContext = (context, callback) => {
  return requestContextStorage.run(context, callback);
};

export const getRequestContext = () => {
  return requestContextStorage.getStore() ?? null;
};
