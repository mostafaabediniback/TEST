// src/context/MapControllerContext.jsx
import { createContext, useContext, useState } from "react";

const MapControllerContext = createContext(null);

export function MapControllerProvider({ children }) {
  const [map, setMap] = useState(null);

  return (
    <MapControllerContext.Provider value={{ map, setMap }}>
      {children}
    </MapControllerContext.Provider>
  );
}

export function useMapController() {
  const context = useContext(MapControllerContext);

  if (!context) {
    throw new Error(
      "useMapController must be used inside MapControllerProvider"
    );
  }

  return context;
}
