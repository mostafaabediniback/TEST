import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildShipOverviewData,
  createShipOverviewBuilder,
  EMPTY_SHIP_OVERVIEW,
  MAX_DETAILED_SHIPS,
} from "@/lib/map/shipOverviewData";

export function useShipOverview(ships, vesselTypes, enabled) {
  const workerRef = useRef(null);
  const workerShipsRef = useRef(null);
  const nextRequest = useRef(0);
  const [result, setResult] = useState(null);
  const smallData = useMemo(
    () => enabled && ships.length <= MAX_DETAILED_SHIPS
      ? buildShipOverviewData(ships, vesselTypes) : null,
    [ships, vesselTypes, enabled],
  );

  useEffect(() => {
    if (!enabled || ships.length <= MAX_DETAILED_SHIPS) {
      workerRef.current?.terminate();
      workerRef.current = null;
      workerShipsRef.current = null;
      return;
    }

    const requestId = ++nextRequest.current;
    let cancelled = false;
    let timer;
    const commit = (overview) => {
      if (!cancelled) setResult({ ships, vesselTypes, overview });
    };
    // CSP restrictions or older browsers may prevent workers. Yield between
    // small batches rather than falling back to a blocking 100K-record loop.
    const fallback = () => {
      const builder = createShipOverviewBuilder(ships, vesselTypes);
      const step = () => {
        if (cancelled) return;
        if (builder.step(1000)) commit(builder.finish());
        else timer = window.setTimeout(step, 0);
      };
      timer = window.setTimeout(step, 0);
    };

    try {
      if (!workerRef.current) {
        workerRef.current = new Worker(
          new URL("../lib/map/shipOverview.worker.js", import.meta.url),
          { type: "module" },
        );
      }
      const worker = workerRef.current;
      worker.onmessage = ({ data }) => {
        if (data.requestId === requestId) commit(data.overview);
      };
      worker.onerror = (event) => {
        event.preventDefault();
        worker.terminate();
        workerRef.current = null;
        workerShipsRef.current = null;
        if (!cancelled) fallback();
      };
      worker.postMessage({
        requestId,
        // Filter changes reuse the worker's existing dataset.
        ships: workerShipsRef.current === ships ? undefined : ships,
        vesselTypes,
      });
      workerShipsRef.current = ships;
    } catch {
      workerRef.current?.terminate();
      workerRef.current = null;
      workerShipsRef.current = null;
      fallback();
    }
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ships, vesselTypes, enabled]);

  useEffect(() => () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    workerShipsRef.current = null;
  }, []);

  const overview = !enabled ? EMPTY_SHIP_OVERVIEW : smallData ??
    (result?.ships === ships && result?.vesselTypes === vesselTypes
      ? result.overview : EMPTY_SHIP_OVERVIEW);
  return { overview, isPending: enabled && !smallData && overview === EMPTY_SHIP_OVERVIEW };
}
