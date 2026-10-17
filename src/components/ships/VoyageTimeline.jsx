import { useEffect, useState } from "react";
import { formatTimestamp, toUnixMilliseconds } from "@/lib/dateTime";

function formatVoyageTime(value) {
  return formatTimestamp(value, {
    unit: "auto",
    options: { dateStyle: "medium", timeStyle: "short" },
  });
}

export default function VoyageTimeline({ voyage }) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const startTime = toUnixMilliseconds(voyage?.departure_time, { unit: "auto" });

  // Treat a missing or empty ETA as unavailable.
  const hasReportedEta =
    voyage?.arrival_time != null && voyage.arrival_time !== "";
  const endTime = hasReportedEta ? toUnixMilliseconds(voyage.arrival_time, { unit: "auto" }) : null;

  const hasTimeRange =
    startTime != null && endTime != null && endTime > startTime;

  const progress = hasTimeRange
    ? Math.min(
        100,
        Math.max(0, ((now - startTime) / (endTime - startTime)) * 100),
      )
    : 0;

  return (
    <section className="rounded-lg border bg-white p-4 shadow-sm w-full">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="">
          <p className="text-xs text-slate-500">Departure from</p>
          <p className="truncate text-sm font-semibold text-slate-900">
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
          <p className="truncate text-sm font-semibold text-slate-900">
            {voyage?.arrival_port_name ||
              (voyage?.arrival_port_id != null
                ? `Port ${voyage.arrival_port_id}`
                : "Not available")}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between gap-4 text-xs text-slate-500">
          <span>Start: {formatVoyageTime(voyage?.departure_time)}</span>
          <span className="text-right">
            End: {formatVoyageTime(voyage?.arrival_time)}
          </span>
        </div>

        <div
          className="relative mt-3 h-2 rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Time elapsed between departure and reported ETA"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={hasTimeRange ? Math.round(progress) : 0}
        >
          {hasTimeRange && (
            <>
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-blue-400"
                style={{ width: `${progress}%` }}
              />
              <span
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${progress}%` }}
                aria-hidden="true"
              >
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2
             h-0 w-0 border-y-[10px] border-y-transparent
             border-l-[18px] border-l-sky-500"
                  style={{ left: `${progress}%` }}
                  aria-hidden="true"
                />
              </span>
            </>
          )}
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {hasTimeRange
            ? `Now · ${Math.round(progress)}% of time range`
            : "Time range unavailable"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-3 text-xs">
        <p className="text-slate-600">
          <span className="mb-1 block text-slate-500">Departure</span>
          {formatVoyageTime(voyage?.departure_time)}
        </p>

        <p className="text-right text-slate-600">
          <span className="mb-1 block text-slate-500">Reported ETA</span>
          {formatVoyageTime(voyage?.arrival_time)}
        </p>
      </div>
    </section>
  );
}
