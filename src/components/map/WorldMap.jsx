import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CarMarkers } from "./CarMarkers";
import { CarDetailsDrawer } from "./CarDetailsDrawer";
import { MapEvents } from "./MapEvents";
import { MapInfoPanel } from "./MapInfoPanel";
import { MapZoomControls } from "./MapZoomControls";
import { VectorTileLayer } from "./VectorTileLayer";
import { useCars } from "@/hooks/useCars";
import { getCars } from "@/api/carsApi";
import { useCarFilters } from "@/context/CarFilterContext";
import { useLocale } from "@/context/LocaleContext";
import { MapPositionProvider, useMapPosition } from "@/context/MapPositionContext";
import { MAX_MAP_ZOOM } from "@/lib/mapPosition";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function WorldMap() {
  return <MapPositionProvider><ResolvedWorldMap /></MapPositionProvider>;
}

function ResolvedWorldMap() {
  const { position, initialCenter } = useMapPosition();
  const [viewport, setViewport] = useState(position);
  const { debouncedSearch, status, showRaster, showVector } = useCarFilters();
  const { direction, t } = useLocale();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCarId = searchParams.get("car");
  const [selectedCar, setSelectedCar] = useState(null);
  const drawerId = useId();
  const mapRegionRef = useRef(null);
  const selectedMarkerRef = useRef(null);

  const requestFilters = useMemo(
    () => ({
      search: debouncedSearch,
      status,
      z: viewport.z,
      x: viewport.x,
      y: viewport.y,
    }),
    [debouncedSearch, status, viewport.z, viewport.x, viewport.y],
  );

  const { data: cars = [], isFetching, isError } = useCars(requestFilters);
  const onViewportChange = useCallback((next) => setViewport((previous) => (
    previous.lat === next.lat && previous.lng === next.lng && previous.z === next.z ? previous : next
  )), []);
  const currentCar = cars.find((car) => String(car.id) === selectedCarId);
  const {
    data: carDetails,
    isError: isDetailsError,
    isFetched: hasFetchedDetails,
  } = useQuery({
    queryKey: ["car-details", selectedCarId],
    queryFn: async () => {
      // Reuse the API's ID search without viewport or status restrictions.
      const matches = await getCars({ search: selectedCarId, status: "all" });
      return matches.find((car) => String(car.id) === selectedCarId) ?? null;
    },
    enabled: Boolean(selectedCarId && !currentCar),
    refetchInterval: 3000,
    staleTime: 1500,
  });
  // Keep the selected car visible while viewport queries refetch or it moves
  // outside the current result set. Fresh results still update its details.
  const focusedCar =
    currentCar ??
    carDetails ??
    (String(selectedCar?.id) === selectedCarId ? selectedCar : null);
  const detailsUnavailable =
    selectedCarId &&
    !focusedCar &&
    (isDetailsError || (hasFetchedDetails && carDetails === null));

  useEffect(() => {
    if (focusedCar) setSelectedCar(focusedCar);
  }, [focusedCar]);

  const onCarSelect = useCallback(
    (car, markerElement) => {
      setSelectedCar(car);
      selectedMarkerRef.current = markerElement;
      // Map movement writes history directly without rerendering the router.
      const next = new URLSearchParams(window.location.search);
      next.set("car", String(car.id));
      navigate(
        { search: next.toString(), hash: window.location.hash },
        { replace: true },
      );
    },
    [navigate],
  );

  const onDrawerOpenChange = useCallback(
    (open) => {
      if (open) return;
      const next = new URLSearchParams(window.location.search);
      next.delete("car");
      navigate(
        { search: next.toString(), hash: window.location.hash },
        { replace: true },
      );
    },
    [navigate],
  );

  const returnFocus = useCallback(
    () =>
      selectedMarkerRef.current?.isConnected
        ? selectedMarkerRef.current
        : mapRegionRef.current,
    [],
  );

  return (
    <div
      ref={mapRegionRef}
      tabIndex={-1}
      className="relative h-full w-full"
      dir={direction}
      role="region"
      aria-label={t("Live map")}
    >
      <MapContainer
        center={initialCenter}
        zoom={position.z}
        minZoom={0}
        maxZoom={MAX_MAP_ZOOM}
        zoomControl={false}
        preferCanvas
        className="z-0"
        style={{ direction: "ltr" }}
      >
        {showRaster ? (
          <TileLayer
            url={import.meta.env.VITE_RASTER_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
            // url={ "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png"}
            // url={
            //   import.meta.env.VITE_RASTER_TILE_URL ||
            //   "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png"
            // }
          />
        ) : null}

        {showVector && import.meta.env.VITE_VECTOR_TILE_URL ? (
          // <VectorTileLayer url={import.meta.env.VITE_VECTOR_TILE_URL} />
           <></>
        ) :
        null}

        <CarMarkers
          cars={cars}
          selectedCarId={selectedCarId}
          drawerId={drawerId}
          onCarSelect={onCarSelect}
        />
        <MapEvents
          onViewportChange={onViewportChange}
          selectedCarId={selectedCarId}
          focusedCar={focusedCar}
          showRaster={showRaster}
        />
        <MapZoomControls />
      </MapContainer>

      <MapInfoPanel
        viewport={viewport}
        count={cars.length}
        isFetching={isFetching}
      />

      <CarDetailsDrawer
        id={drawerId}
        car={focusedCar ?? selectedCar}
        open={Boolean(selectedCarId && focusedCar)}
        onOpenChange={onDrawerOpenChange}
        finalFocus={returnFocus}
      />

      {isError || detailsUnavailable ? (
        <Alert
          variant="destructive"
          className="absolute start-3 end-20 top-3 z-[700] w-auto max-w-sm bg-background shadow-panel"
        >
          <CircleAlert className="size-4" />
          <AlertDescription>
            {t(
              detailsUnavailable
                ? "Could not load car details."
                : "Could not load cars. Please try again.",
            )}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
