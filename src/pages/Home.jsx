import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { format, parseISO } from "date-fns";
import { Anchor, Building2, MapPin, Route, Ship } from "lucide-react";

import { Button } from "@/components/ui/button";
import DateRangeFilter from "@/components/DateRangeFilter";
import { useLocale } from "@/context/LocaleContext";
import { useRecordCounts } from "@/hooks/useRecordCounts";
import { useRecordSummary } from "@/hooks/useRecordSummary";

const metrics = [
  {
    key: "position",
    label: "Positions",
    icon: MapPin,
    color: "bg-sky-50 text-sky-700",
  },
  {
    key: "voyage",
    label: "Voyages",
    icon: Route,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "ship",
    label: "Ships",
    icon: Ship,
    color: "bg-violet-50 text-violet-700",
  },
  {
    key: "port",
    label: "Ports",
    icon: Anchor,
    color: "bg-amber-50 text-amber-700",
  },
  {
    key: "company",
    label: "Companies",
    icon: Building2,
    color: "bg-rose-50 text-rose-700",
  },
];

const colors = ["#93C5FD", "#86EFAC", "#FCD34D", "#C4B5FD", "#FDA4AF"];
const intervals = ["month", "week", "day", "hour", "minute"];

function toUnixSeconds(date) {
  return date ? Math.floor(date.getTime() / 1000) : undefined;
}

function ChartCard({ title, subtitle, actions, children }) {
  return (
    <article className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {actions}
      </div>
      <div className="p-3 sm:p-5">{children}</div>
    </article>
  );
}

export default function Home() {
  const { locale } = useLocale();
  const chartFontFamily = locale === "en" ? "Roboto" : "Sahel";

  const [interval, setInterval] = useState("day");
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  const [chartType, setChartType] = useState("line");

  const validRange =
    !dateRange.from || !dateRange.to || dateRange.from <= dateRange.to;

  const params = useMemo(
    () => ({
      interval,
      start: toUnixSeconds(dateRange.from),
      end: toUnixSeconds(dateRange.to),
    }),
    [interval, dateRange.from, dateRange.to],
  );

  const {
    data: records = [],
    isLoading,
    isError,
    error,
  } = useRecordCounts(params, { enabled: validRange });

  const summaryParams = useMemo(
    () => ({
      start: toUnixSeconds(dateRange.from),
      end: toUnixSeconds(dateRange.to),
    }),
    [dateRange.from, dateRange.to],
  );

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useRecordSummary(summaryParams, { enabled: validRange });

  const summaryTable = summary?.table ?? {};

  const latestRecord = records.length ? records[records.length - 1] : null;

  const chartOption = useMemo(() => {
    const labels = records.map((record) => {
      const date = parseISO(record.time);

      if (interval === "minute" || interval === "hour") {
        return format(date, "MMM d, HH:mm");
      }

      if (interval === "month") {
        return format(date, "MMM yyyy");
      }

      return format(date, "MMM d");
    });

    return {
      textStyle: { fontFamily: chartFontFamily },
      color: colors,
      tooltip: { trigger: "axis" },
      legend: { top: 0, icon: "circle" },
      grid: { left: 48, right: 20, top: 42, bottom: 48 },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: { hideOverlap: true },
      },
      yAxis: {
        type: "value",
        min: 0,
        splitLine: { lineStyle: { color: "#f0f2f6" } },
      },
      series: metrics.map(({ key, label }) => ({
        name: label,
        type: "line",
        smooth: true,
        showSymbol: false,
        data: records.map((record) => record[key] ?? 0),
        ...(chartType === "area"
          ? {
              stack: "total",
              areaStyle: { opacity: 0.45 },
            }
          : {}),
      })),
    };
  }, [records, interval, chartType, chartFontFamily]);

  function resetFilters() {
    setInterval("day");
    setDateRange({ from: undefined, to: undefined });
  }

  return (
    <main className="mx-auto w-full max-w-screen-2xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Records overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View record counts over time.
        </p>
      </header>


      <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Filters</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose an interval and optional date and time range.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={resetFilters}>
            Reset filters
          </Button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            <span>Interval</span>
            <select
              value={interval}
              onChange={(event) => setInterval(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {intervals.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid content-start gap-2 text-sm font-medium">
            <span>Date and time range</span>
            <DateRangeFilter
              label="Date and time range"
              className="min-h-9 w-full"
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
        </div>
      </section>

      {!validRange && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          The start must be before or equal to the end.
        </p>
      )}

<section
  aria-label="Record totals"
  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
>
  {metrics.map(({ key, label, icon: Icon, color }) => {
    const counts = summary?.table?.[key];

    return (
      <article
        className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        key={key}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className={`rounded-lg p-2 ${color}`}>
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>

        <p className="mt-3 text-2xl font-semibold tabular-nums">
          {counts?.total?.toLocaleString() ?? "—"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Total</p>
      </article>
    );
  })}
</section>


      <ChartCard
        title="Record counts"
        subtitle={`Counts grouped by ${interval}`}
        actions={
          <div
            className="inline-flex w-fit rounded-lg border bg-muted p-1"
            role="group"
            aria-label="Chart type"
          >
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                chartType === "line"
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={chartType === "line"}
              onClick={() => setChartType("line")}
            >
              Line
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                chartType === "area"
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={chartType === "area"}
              onClick={() => setChartType("area")}
            >
              Stacked area
            </button>
          </div>
        }
      >
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading record counts…
          </p>
        ) : isError ? (
          <p
            role="alert"
            className="py-12 text-center text-sm text-destructive"
          >
            Could not load record counts
            {error?.message ? `: ${error.message}` : "."}
          </p>
        ) : records.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No record counts found for this filter.
          </p>
        ) : (
          <ReactECharts
            key={`${chartFontFamily}-${chartType}`}
            option={chartOption}
            notMerge
            style={{ height: 320 }}
          />
        )}
      </ChartCard>
    </main>
  );
}
