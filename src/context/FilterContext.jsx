import { createContext, useContext, useMemo, useState } from "react";

import { ALL_VESSEL_TYPES } from "@/lib/vesselTypes";

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [status, setStatus] = useState("all");
  const [vesselTypes, setVesselTypes] = useState(ALL_VESSEL_TYPES);

  const value = useMemo(
    () => ({
      status,
      setStatus,
      vesselTypes,
      setVesselTypes,
    }),
    [status, vesselTypes],
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