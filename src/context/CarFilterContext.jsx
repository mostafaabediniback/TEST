import { createContext, useContext, useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const CarFilterContext = createContext(null);

export function CarFilterProvider({ children }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showRaster, setShowRaster] = useState(true);
  const [showVector, setShowVector] = useState(Boolean(import.meta.env.VITE_VECTOR_TILE_URL));
  const debouncedSearch = useDebouncedValue(search, 400);

  const value = useMemo(
    () => ({
      search,
      setSearch,
      debouncedSearch,
      status,
      setStatus,
      showRaster,
      setShowRaster,
      showVector,
      setShowVector,
    }),
    [search, debouncedSearch, status, showRaster, showVector],
  );

  return <CarFilterContext.Provider value={value}>{children}</CarFilterContext.Provider>;
}

export function useCarFilters() {
  const context = useContext(CarFilterContext);
  if (!context) throw new Error("useCarFilters must be used inside CarFilterProvider");
  return context;
}
