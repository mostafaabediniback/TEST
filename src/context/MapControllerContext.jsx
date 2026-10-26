// src/context/MapControllerContext.jsx
import { createContext, useCallback, useContext, useRef, useState } from "react";

const MapControllerContext = createContext(null);

export function MapControllerProvider({ children }) {
  const [map, setMap] = useState(null);
  const [mapView, setMapView] = useState(null);
  const [selectedShip, setSelectedShip] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);
  const [mapFocusRequest, setMapFocusRequest] = useState(null);
  const focusSequence = useRef(0);
  const requestMapFocus = useCallback((target) => {
    if (target) setMapFocusRequest({ ...target, id: ++focusSequence.current });
  }, []);
  const consumeMapFocus = useCallback((id) => {
    setMapFocusRequest((current) => current?.id === id ? null : current);
  }, []);

  return (
    <MapControllerContext.Provider value={{
      map, setMap, mapView, setMapView,
      selectedShip, setSelectedShip, selectedPort, setSelectedPort,
      mapFocusRequest, requestMapFocus, consumeMapFocus,
    }}>
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
