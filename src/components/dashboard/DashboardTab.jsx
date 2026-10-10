import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Inbox, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardLocale } from "@/components/dashboard/useDashboardLocale";
import FilterBar from "./FilterBar";
import KpiCard from "./KpiCard";
import DataTable from "./DataTable";
import { CHART_KEYS, KPI_KEYS, getColumns, REPORT_TYPES } from "./config";
import { buildChartOption } from "./chartOptions";
const ChartContainer = lazy(() => import("./ChartContainer"));
const FILTER_KEYS = [
  "dateFrom",
  "dateTo",
  "vehicleId",
  "parkingId",
  "originParkingId",
  "destinationParkingId",
  "vehicleStatus",
  "status",
  "trafficType",
  "delayedOnly",
  "reportType",
  "search",
  "page",
  "pageSize",
  "sortBy",
  "sortOrder",
  "visibleColumns",
];
function LoadingState() {
  const { t } = useDashboardLocale();
  return (
    <div role="status" className="space-y-5">
      <span className="sr-only">{t("dashboard.loading")}</span>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
export default function DashboardTab({ tab, service }) {
  const context = useDashboardLocale();
  const { t, formatNumber, locale } = context;
  const [params, setParams] = useSearchParams();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const filters = useMemo(
    () =>
      Object.fromEntries(
        FILTER_KEYS.flatMap((key) => {
          const value = params.get(tab + "." + key);
          if (!value) return [];
          return [
            [
              key,
              key === "delayedOnly"
                ? value === "true"
                : ["page", "pageSize"].includes(key)
                  ? Number(value)
                  : value,
            ],
          ];
        }),
      ),
    [params, tab],
  );
  const reportType = REPORT_TYPES.includes(filters.reportType)
    ? filters.reportType
    : "movements";
  const chartKeys = useMemo(
    () =>
      tab !== "reports"
        ? CHART_KEYS[tab]
        : reportType === "parking_events"
          ? CHART_KEYS.parkings.slice(0, 2)
          : reportType === "vehicle_performance"
            ? ["vehicleTrips", "durationComparison"]
            : reportType === "route_performance"
              ? ["routeTraffic", "routeDuration"]
              : reportType === "delays"
                ? ["delayTrend", "routeTraffic"]
                : CHART_KEYS.reports,
    [tab, reportType],
  );
  const kpiKeys =
    tab === "reports" && reportType === "parking_events"
      ? ["totalEntries", "totalExits", "activeParkings", "stationedVehicles"]
      : KPI_KEYS[tab];
  const referenceAt = params.get("referenceAt") || undefined;
  const mockState = params.get("mockState") || undefined;
  const updateFilters = useCallback(
    (updates, resetPage = true) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(updates)) {
            if (value == null || value === "" || value === false)
              next.delete(tab + "." + key);
            else next.set(tab + "." + key, String(value));
          }
          if (resetPage) next.delete(tab + ".page");
          return next;
        },
        { replace: true },
      );
    },
    [setParams, tab],
  );
  function reset() {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        FILTER_KEYS.forEach((key) => next.delete(tab + "." + key));
        return next;
      },
      { replace: true },
    );
  }
  const query = useQuery({
    queryKey: ["dashboard", tab, filters, referenceAt, mockState],
    queryFn: ({ signal }) =>
      service(
        { ...filters, reportType },
        {
          signal,
          referenceAt,
          mockState,
          delay: mockState === "loading" ? 6000 : 180,
        },
      ),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: referenceAt ? false : 60_000,
    placeholderData: (previous) => previous,
  });
  const response = query.data;
  const columns = useMemo(() => getColumns(tab, reportType), [tab, reportType]);
  const defaultColumns = columns
    .filter(
      (column) =>
        tab === "reports" ||
        tab === "vehicles" ||
        tab === "parkings" ||
        !["registration", "elapsedMinutes", "vehicleId"].includes(column.key),
    )
    .map((column) => column.key);
  const selectedColumns = filters.visibleColumns
    ?.split(",")
    .filter((key) => columns.some((column) => column.key === key));
  const visibleColumns = selectedColumns?.length
    ? selectedColumns
    : defaultColumns;
  const chartOptions = useMemo(
    () =>
      response
        ? Object.fromEntries(
            chartKeys.map((key) => [
              key,
              buildChartOption(key, response.data.charts, {
                t,
                formatNumber,
                locale,
              }),
            ]),
          )
        : {},
    [response, chartKeys, t, formatNumber, locale],
  );
  const selectParking = useCallback(
    (event) => {
      const rows = response?.data.charts.parkingTraffic ?? [];
      const row = rows.find((row) => row.parkingName === event.name);
      if (row) updateFilters({ parkingId: row.id });
    },
    [response, updateFilters],
  );
  async function exportFile(format) {
    setExporting(true);
    setExportError("");
    try {
      const snapshot = await service(
        { ...filters, reportType, exportAll: true },
        { referenceAt: response.meta.generatedAt, mockState, delay: 0 },
      );
      const { exportReport } = await import("./exports");
      await exportReport(
        format,
        snapshot,
        columns.filter((column) => visibleColumns.includes(column.key)),
        context,
      );
    } catch (error) {
      setExportError(error.message);
    } finally {
      setExporting(false);
    }
  }
  const total = response?.meta.pagination.totalItems ?? 0;
  return (
    <div
      id={"panel-" + tab}
      role="tabpanel"
      aria-labelledby={"tab-" + tab}
      className="space-y-5"
    >
      <FilterBar
        tab={tab}
        filters={{ ...filters, reportType }}
        options={response?.data.options}
        onChange={updateFilters}
        onReset={reset}
      />
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border bg-card px-4 py-12"
        >
          <AlertCircle className="size-8 text-destructive" />
          <h2 className="font-semibold">{t("dashboard.error")}</h2>
          <p className="text-sm text-muted-foreground">{query.error.message}</p>
          <Button variant="outline" onClick={() => query.refetch()}>
            <RefreshCw className="size-4" />
            {t("dashboard.retry")}
          </Button>
        </div>
      ) : (
        <>
          <div
            aria-busy={query.isFetching}
            className={
              "grid grid-cols-2 gap-3 md:grid-cols-3 " +
              (kpiKeys.length === 6 ? "xl:grid-cols-6" : "xl:grid-cols-5")
            }
          >
            {kpiKeys.map((metric) => (
              <KpiCard
                key={metric}
                metric={metric}
                value={response.data.summary[metric]}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.snapshot")} ·{" "}
            {new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : locale, {
              timeZone: "Asia/Tehran",
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(response.meta.generatedAt))}
          </p>
          {!total && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card p-8">
              <Inbox className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">{t("dashboard.empty")}</p>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.emptyHint")}
              </p>
            </div>
          )}
          {!!total && (
            <Suspense fallback={<LoadingState />}>
              <div className="grid min-w-0 gap-5 lg:grid-cols-2">
                {chartKeys.map((key) => {
                  const chartData = response.data.charts[key];
                  const empty =
                    key === "vehicleTrend"
                      ? !filters.vehicleId
                      : key === "sankey"
                        ? !chartData.links.length
                        : !chartData.length ||
                          (key === "durationComparison" &&
                            chartData.every(
                              (row) =>
                                row.averageDurationMinutes == null &&
                                row.estimatedMinutes == null,
                            )) ||
                          (key === "routeDuration" &&
                            chartData.every(
                              (row) => row.averageDurationMinutes == null,
                            )) ||
                          (key === "vehicleStatus" &&
                            !chartData.some((row) => row.value));
                  return (
                    <ChartContainer
                      key={key}
                      chartKey={key}
                      option={chartOptions[key]}
                      empty={empty}
                      onSelect={
                        [
                          "parkingTraffic",
                          "parkingRanking",
                          "parkedByParking",
                        ].includes(key)
                          ? selectParking
                          : undefined
                      }
                      wide={key === "sankey" || key === "heatmap"}
                      hint={
                        key === "sankey"
                          ? t("dashboard.sankeyHint")
                          : key === "vehicleTrend" && !filters.vehicleId
                            ? t("dashboard.chooseVehicle")
                            : undefined
                      }
                    />
                  );
                })}
              </div>
            </Suspense>
          )}
          {tab === "reports" && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
              <div>
                <p className="text-sm font-medium">{t("dashboard.export")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("dashboard.exportNote")}
                </p>
              </div>
              <div className="flex gap-2">
                {["xlsx", "csv", "pdf"].map((format) => (
                  <Button
                    key={format}
                    variant={format === "xlsx" ? "default" : "outline"}
                    size="sm"
                    disabled={exporting || !total || query.isFetching}
                    onClick={() => exportFile(format)}
                  >
                    <Download className="size-4" />
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
              {exporting && (
                <span
                  role="status"
                  className="w-full text-xs text-muted-foreground"
                >
                  {t("dashboard.exporting")}
                </span>
              )}
              {exportError && (
                <p role="alert" className="w-full text-sm text-destructive">
                  {exportError}
                </p>
              )}
            </div>
          )}
          <DataTable
            tab={tab}
            response={response}
            columns={columns}
            visibleColumns={visibleColumns}
            filters={filters}
            onChange={updateFilters}
            onColumnsChange={(keys) =>
              updateFilters({ visibleColumns: keys.join(",") }, false)
            }
            fetching={query.isFetching}
          />
        </>
      )}
    </div>
  );
}
