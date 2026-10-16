import { createContext, useContext, useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const value = useMemo(
    () => ({ search, setSearch, debouncedSearch }),
    [search, debouncedSearch],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch must be used within SearchProvider");
  return context;
}