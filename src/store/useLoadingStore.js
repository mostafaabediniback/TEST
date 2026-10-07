import { useSyncExternalStore } from "react";

const listeners = new Set();
const startLoading = () => updateCount(state.loadingCount + 1);
const stopLoading = () => updateCount(Math.max(0, state.loadingCount - 1));
const resetLoading = () => updateCount(0);

let state = {
  loadingCount: 0,
  isLoading: false,
  startLoading,
  stopLoading,
  resetLoading,
};

function updateCount(loadingCount) {
  if (loadingCount === state.loadingCount) return;
  state = { ...state, loadingCount, isLoading: loadingCount > 0 };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useLoadingStore() {
  return useSyncExternalStore(subscribe, () => state);
}

useLoadingStore.getState = () => state;

export default useLoadingStore;
