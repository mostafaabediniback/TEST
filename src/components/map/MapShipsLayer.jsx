import { useShipsInVisibleTiles } from "@/hooks/useShipsInTiles";
import ShipMarkers from "../ships/ShipMarkers";

export default function MapShipsLayer() {
  const {
    ships,
    isPending,
    isError,
    errors,
  } = useShipsInVisibleTiles();

  if (isError) {
    console.error("Failed to load ships:", errors);
  }

  return (
    <>
      {isPending && (
        <div className="absolute left-4 top-4 z-[1000] rounded bg-white px-3 py-2 shadow">
          Loading ships...
        </div>
      )}

      <ShipMarkers  ships={ships} />
    </>
  );
}
