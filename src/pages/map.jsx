import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Map as MapLibreMap,
  setWorkerUrl,
} from "maplibre-gl";

import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import {
  MapLibreOverlay,
} from "@deck.gl/maplibre";

import {
  ScatterplotLayer,
} from "@deck.gl/layers";

import { useData } from "@/hooks/useData";

import {
  getVisibleTiles,
  lngLatToTile,
} from "@/utils/getVisibleTiles";

import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(maplibreWorkerUrl);

const DEFAULT_CENTER = [
  51.3998,
  35.6997,
];

const DEFAULT_ZOOM = 5;

function getPointColor(status) {
  if (status === 1) {
    return [34, 197, 94, 220];
  }

  if (status === 2) {
    return [245, 158, 11, 220];
  }

  return [107, 114, 128, 220];
}

function areTilesEqual(
  currentTiles,
  nextTiles,
) {
  if (
    currentTiles.length !==
    nextTiles.length
  ) {
    return false;
  }

  for (
    let i = 0;
    i < currentTiles.length;
    i += 1
  ) {
    const current =
      currentTiles[i];

    const next =
      nextTiles[i];

    if (
      current.z !== next.z ||
      current.x !== next.x ||
      current.y !== next.y
    ) {
      return false;
    }
  }

  return true;
}

export default function Map() {
  const containerRef =
    useRef(null);

  const mapRef =
    useRef(null);

  const overlayRef =
    useRef(null);

  const [
    visibleTiles,
    setVisibleTiles,
  ] = useState([]);

  const [
    overlayReady,
    setOverlayReady,
  ] = useState(false);

  const {
    data: points,
    isLoading,
    isError,
  } = useData(visibleTiles);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let destroyed = false;

    const createMap = (
      center,
    ) => {
      if (destroyed) {
        return;
      }

      const map =
        new MapLibreMap({
          container:
            containerRef.current,

          center,

          zoom:
            DEFAULT_ZOOM,

          minZoom: 2,
          maxZoom: 19,

          style: {
            version: 8,

            sources: {
              baseMap: {
                type: "raster",

                tiles: [
                  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                ],

                tileSize: 256,

                attribution:
                  "© OpenStreetMap contributors",
              },
            },

            layers: [
              {
                id: "base-map",
                type: "raster",
                source:
                  "baseMap",
              },
            ],
          },
        });

      const overlay =
        new MapLibreOverlay({
          interleaved: true,
          layers: [],
        });

      map.addControl(
        overlay,
      );

      mapRef.current =
        map;

      overlayRef.current =
        overlay;

      setOverlayReady(true);

      const updateTiles =
        () => {
          const nextTiles =
            getVisibleTiles(
              map,
            );

          setVisibleTiles(
            (
              currentTiles,
            ) => {
              if (
                areTilesEqual(
                  currentTiles,
                  nextTiles,
                )
              ) {
                return currentTiles;
              }

              return nextTiles;
            },
          );

          const center =
            map.getCenter();

          const zoom =
            Math.floor(
              map.getZoom(),
            );

          const centerTile =
            lngLatToTile(
              center.lng,
              center.lat,
              zoom,
            );

          const url =
            new URL(
              window.location.href,
            );

          url.searchParams.set(
            "z",
            centerTile.z,
          );

          url.searchParams.set(
            "x",
            centerTile.x,
          );

          url.searchParams.set(
            "y",
            centerTile.y,
          );

          window.history.replaceState(
            window.history.state,
            "",
            url.toString(),
          );

          console.log(
            "Visible tiles:",
            nextTiles,
          );
        };

      map.on(
        "load",
        updateTiles,
      );

      map.on(
        "moveend",
        updateTiles,
      );

      map.on(
        "zoomend",
        updateTiles,
      );

      map.on(
        "resize",
        updateTiles,
      );
    };

    if (
      navigator.geolocation
    ) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const {
            longitude,
            latitude,
          } =
            position.coords;

          createMap([
            longitude,
            latitude,
          ]);
        },

        () => {
          createMap(
            DEFAULT_CENTER,
          );
        },

        {
          enableHighAccuracy:
            false,

          timeout: 5000,

          maximumAge:
            60_000,
        },
      );
    } else {
      createMap(
        DEFAULT_CENTER,
      );
    }

    return () => {
      destroyed = true;

      setOverlayReady(
        false,
      );

      if (
        mapRef.current
      ) {
        mapRef.current.remove();

        mapRef.current =
          null;
      }

      overlayRef.current =
        null;
    };
  }, []);

  useEffect(() => {
    if (
      !overlayReady ||
      !overlayRef.current
    ) {
      return;
    }

    const pointsLayer =
      new ScatterplotLayer({
        id: "points-layer",

        data: points,

        getPosition: (
          point,
        ) => [
          point.longitude,
          point.latitude,
        ],

        getRadius: 8,

        radiusUnits:
          "pixels",

        getFillColor: (
          point,
        ) =>
          getPointColor(
            point.status,
          ),

        pickable: true,

        autoHighlight:
          true,

        highlightColor: [
          255,
          255,
          255,
          180,
        ],

        onClick: ({
          object,
        }) => {
          if (!object) {
            return;
          }

          console.log(
            "Clicked point:",
            object,
          );
        },

        onHover: ({
          object,
        }) => {
          if (
            !mapRef.current
          ) {
            return;
          }

          mapRef.current
            .getCanvas()
            .style.cursor =
            object
              ? "pointer"
              : "";
        },
      });

    overlayRef.current.setProps({
      layers: [
        pointsLayer,
      ],
    });
  }, [
    points,
    overlayReady,
  ]);

  return (
    <section className="relative h-full min-h-0 overflow-hidden">
      <div
        ref={containerRef}
        className="h-full w-full"
      />

      {isLoading && (
        <div className="absolute left-4 top-4 rounded bg-white px-3 py-2 text-sm shadow">
          Loading...
        </div>
      )}

      {isError && (
        <div className="absolute left-4 top-4 rounded bg-white px-3 py-2 text-sm shadow">
          Error loading points
        </div>
      )}
    </section>
  );
}
