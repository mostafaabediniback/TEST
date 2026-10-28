import { useVoyagePositionsTimeline } from "@/hooks/useVoyagePositionsTimeline";
import { formatTimestamp, toUnixMilliseconds } from "@/lib/dateTime";
import { useEffect, useState } from "react";

function formatVoyageTime(value) {
  return formatTimestamp(value, {
    unit: "auto",
    options: { dateStyle: "medium", timeStyle: "short" },
  });
}

export default function VoyageTimeline({ voyage, compact = false }) {
  console.log(voyage);
  const [now, setNow] = useState(Date.now);
  const { data: timelineData } = useVoyagePositionsTimeline(voyage?.id);
  console.log(timelineData);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const startTime = toUnixMilliseconds(voyage?.departure_time, {
    unit: "auto",
  });

  // Treat a missing or empty ETA as unavailable.
  const hasReportedEta =
    voyage?.arrival_time != null && voyage.arrival_time !== "";
  const endTime = hasReportedEta
    ? toUnixMilliseconds(voyage.arrival_time, { unit: "auto" })
    : null;

  const hasTimeRange =
    startTime != null && endTime != null && endTime > startTime;

  const progress = hasTimeRange
    ? Math.min(
        100,
        Math.max(0, ((now - startTime) / (endTime - startTime)) * 100),
      )
    : 0;

  const statusSegments = hasTimeRange
    ? (timelineData ?? [])
        .map((item) => {
          const from = Number(item.from_time) * 1000;
          const to = Number(item.to_time) * 1000;

          // Clip the interval to the voyage range.
          const clippedFrom = Math.max(from, startTime);
          const clippedTo = Math.min(to, endTime);

          if (clippedTo <= clippedFrom) return null;

          return {
            ...item,
            left: ((clippedFrom - startTime) / (endTime - startTime)) * 100,
            width: ((clippedTo - clippedFrom) / (endTime - startTime)) * 100,
          };
        })
        .filter(Boolean)
    : [];

  return (
    <section
      className={`w-full min-w-0 rounded-lg border bg-white shadow-sm ${compact ? "p-3" : "p-4"}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">Departure from</p>
          <p className="break-words text-sm font-semibold text-slate-900">
            {voyage?.departure_port_name ||
              (voyage?.departure_port_id != null
                ? `Port ${voyage.departure_port_id}`
                : "Not available")}
          </p>
        </div>

        <span className="text-slate-400" aria-hidden="true">
          →
        </span>

        <div className="min-w-0 text-right">
          <p className="text-xs text-slate-500">Arrival at</p>
          <p className="break-words text-sm font-semibold text-slate-900">
            {voyage?.arrival_port_name ||
              (voyage?.arrival_port_id != null
                ? `Port ${voyage.arrival_port_id}`
                : "Not available")}
          </p>
        </div>
      </div>

      <div className={compact ? "mt-3" : "mt-5"}>
        <div className="flex justify-between gap-4 text-xs text-slate-500">
          <span className="min-w-0 flex-1 break-words">
            Start: {formatVoyageTime(voyage?.departure_time)}
          </span>
          <span className="min-w-0 flex-1 break-words text-right">
            End: {formatVoyageTime(voyage?.arrival_time)}
          </span>
        </div>

        <div
          className="relative mt-3 h-3 rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Voyage timeline"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={hasTimeRange ? Math.round(progress) : 0}
        >
          {statusSegments.map((segment, index) => (
            <div
              key={`${segment.from_time}-${segment.to_time}-${index}`}
              className="absolute inset-y-0 rounded-full bg-emerald-400/70"
              style={{
                left: `${segment.left}%`,
                width: `${segment.width}%`,
              }}
              title={`${segment.status}: ${formatVoyageTime(segment.from_time * 1000)} – ${formatVoyageTime(segment.to_time * 1000)}`}
            />
          ))}

          {hasTimeRange && (
            <>
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-blue-400/50"
                style={{ width: `${progress}%` }}
              />
              <span
                className="absolute top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2
          border-y-[8px] border-y-transparent border-l-[12px] border-l-sky-600"
                style={{ left: `${progress}%` }}
                aria-hidden="true"
              />
            </>
          )}
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {hasTimeRange
            ? `Now · ${Math.round(progress)}% of time range`
            : "Time range unavailable"}
        </p>
      </div>

      <div
        className={`${compact ? "mt-3 pt-2" : "mt-4 pt-3"} grid grid-cols-2 gap-4 border-t text-xs`}
      >
        <p className="min-w-0 break-words text-slate-600">
          <span className="mb-1 block text-slate-500">Departure</span>
          {formatVoyageTime(voyage?.departure_time)}
        </p>

        <p className="min-w-0 break-words text-right text-slate-600">
          <span className="mb-1 block text-slate-500">Reported ETA</span>
          {formatVoyageTime(voyage?.arrival_time)}
        </p>
      </div>
    </section>
  );
}
