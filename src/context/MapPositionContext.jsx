import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { buildViewport, DEFAULT_CENTER, DEFAULT_ZOOM, readUrlPosition, replaceUrlPosition } from "@/lib/mapPosition";

const MapPositionContext = createContext(null);

function resolveInitialPosition() {
  const search = window.location.search;
  const fromUrl = readUrlPosition(search);
  const initialCarId = new URLSearchParams(search).get("car");
  if (fromUrl) return Promise.resolve({ position: fromUrl, restoredFromUrl: true, initialCarId });

  return new Promise((resolve) => {
    const finish = (lat = DEFAULT_CENTER[0], lng = DEFAULT_CENTER[1]) => resolve({
      position: buildViewport(lat, lng, DEFAULT_ZOOM), restoredFromUrl: false, initialCarId,
    });
    if (!navigator.geolocation) {
      finish();
      return;
    }
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          if (Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude)) {
            finish(Math.max(-85.0511287798066, Math.min(85.0511287798066, coords.latitude)), coords.longitude);
          } else {
            finish();
          }
        },
        () => finish(),
        { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
      );
    } catch {
      finish();
    }
  });
}

export function MapPositionProvider({ children }) {
  const resolutionRef = useRef(null);
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    let active = true;
    // Reuse the pending resolution across StrictMode's effect replay.
    resolutionRef.current ??= resolveInitialPosition();
    resolutionRef.current.then((resolved) => {
      if (!active) return;
      replaceUrlPosition(resolved.position);
      setInitial(resolved);
    });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => initial && ({
    ...initial,
    initialCenter: [initial.position.lat, initial.position.lng],
    savePosition: replaceUrlPosition,
  }), [initial]);

  // No map instance or car query exists until URL/geolocation/fallback resolves.
  return value ? <MapPositionContext.Provider value={value}>{children}</MapPositionContext.Provider> : null;
}

export function useMapPosition() {
  const context = useContext(MapPositionContext);
  if (!context) throw new Error("useMapPosition must be used inside MapPositionProvider");
  return context;
}
