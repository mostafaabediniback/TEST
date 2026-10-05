import { createContext, useContext, useMemo, useState } from "react";

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [status, setStatus] = useState("all");

  const value = useMemo(
    () => ({
      status,
      setStatus,
    }),
    [status],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error("useFilters must be used inside FilterProvider");
  }

  return context;
}
