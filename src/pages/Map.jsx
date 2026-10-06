import { useCallback, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/components/map/map.css";
import { CarsDataLayer } from "@/components/map/CarsDataLayer";
import { MapStats } from "@/components/map/MapStats";
import { VisibleTilesTracker } from "@/components/map/VisibleTilesTracker";

const DEFAULT_CENTER = [35.6997, 51.3998];
const DEFAULT_ZOOM = 13;

function areTilesEqual(currentTiles, nextTiles) {
  if (currentTiles.length !== nextTiles.length) return false;

  for (let index = 0; index < currentTiles.length; index += 1) {
    const current = currentTiles[index];
    const next = nextTiles[index];

    if (current.z !== next.z || current.x !== next.x || current.y !== next.y) {
      return false;
    }
  }

  return true;
}

function MapContent() {
  const [visibleTiles, setVisibleTiles] = useState([]);
  const [stats, setStats] = useState({ cars: 0, tiles: 0, fetching: 0 });

  const handleTilesChange = useCallback((nextTiles) => {
    setVisibleTiles((currentTiles) =>
      areTilesEqual(currentTiles, nextTiles) ? currentTiles : nextTiles,
    );
  }, []);

  const handleStatsChange = useCallback((nextStats) => {
    setStats((currentStats) => {
      if (
        currentStats.cars === nextStats.cars &&
        currentStats.tiles === nextStats.tiles &&
        currentStats.fetching === nextStats.fetching
      ) {
        return currentStats;
      }

      return nextStats;
    });
  }, []);

  return (
    <section className="relative h-full min-h-0 overflow-hidden bg-muted/30" aria-label="Map">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={3}
        maxZoom={19}
        zoomControl
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          tileSize={256}
          updateWhenIdle
          keepBuffer={2}
        />

        <VisibleTilesTracker onChange={handleTilesChange} />
        <CarsDataLayer tiles={visibleTiles} onStatsChange={handleStatsChange} />
      </MapContainer>

      <MapStats stats={stats} />
    </section>
  );
}

export default function MapPage() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MapContent />
    </QueryClientProvider>
  );
}
