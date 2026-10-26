import { useEffect, useMemo, useState } from "react";
import { buildPortOverviewData, createPortOverviewBuilder, EMPTY_PORT_OVERVIEW } from "@/lib/map/portOverviewData";

export function usePortOverview(ports) {
  const [result, setResult] = useState(null);
  const smallData = useMemo(() => ports.length <= 2000 ? buildPortOverviewData(ports) : null, [ports]);
  useEffect(() => {
    if (ports.length <= 2000) return;
    const builder = createPortOverviewBuilder(ports);
    let cancelled = false;
    let timer;
    const step = () => {
      if (cancelled) return;
      if (builder.step(1000)) setResult({ ports, data: builder.finish() });
      else timer = window.setTimeout(step, 0);
    };
    timer = window.setTimeout(step, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [ports]);
  const data = smallData ?? (result?.ports === ports ? result.data : EMPTY_PORT_OVERVIEW);
  return { data, isPending: !smallData && data === EMPTY_PORT_OVERVIEW };
}
