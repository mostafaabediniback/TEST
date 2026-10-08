import { createContext, useContext, useState } from "react";

const MapInfoContext = createContext(null);

const initialMapInfo = {
  lat: null,
  lng: null,
  x: null,
  y: null,
  z: null,
};

export function MapInfoProvider({ children }) {
  const [mapInfo, setMapInfo] = useState(initialMapInfo);

  return (
    <MapInfoContext.Provider value={{ mapInfo, setMapInfo }}>
      {children}
    </MapInfoContext.Provider>
  );
}

export function useMapInfo() {
  const context = useContext(MapInfoContext);

  if (!context) {
    throw new Error(
      "useMapInfo must be used inside MapInfoProvider"
    );
  }

  return context;
}
