import { createContext, useContext } from "react";
import useLoadingStore from "@/store/useLoadingStore";

const LoadingContext = createContext(null);

export const startGlobalLoading = () => useLoadingStore.getState().startLoading();
export const stopGlobalLoading = () => useLoadingStore.getState().stopLoading();

export function LoadingProvider({ children }) {
  const loading = useLoadingStore();
  return (
    <LoadingContext.Provider value={loading}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used inside LoadingProvider");
  }
  return context;
}
