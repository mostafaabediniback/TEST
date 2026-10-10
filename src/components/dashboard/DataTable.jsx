import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Eye,
  Search,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardLocale } from "@/components/dashboard/useDashboardLocale";
import { cellValue } from "./format";
import { getShipDetailsNavigation } from "@/lib/shipNavigation";
export default function DataTable({
  tab,
  response,
  columns,
  visibleColumns,
  filters,
  onChange,
  onColumnsChange,
  fetching,
}) {
  const context = useDashboardLocale();
  const { t, direction, formatNumber } = context;
  const location = useLocation();
  const pagination = response?.meta.pagination ?? {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  };
  const items = response?.data.items ?? [];
  const shown = columns.filter((column) => visibleColumns.includes(column.key));
  function details(row) {
    const nav = getShipDetailsNavigation(
      {
        id: row.vehicleId,
        name: row.vehicleTitle,
        registration: row.registration,
      },
      { source: "home", returnTo: location.pathname + location.search },
    );
    nav.to += "&mock=dashboard";
    nav.state.dashboardMock = {
      voyage: {
        departure: row.actualDepartureAt,
        eta: row.estimatedArrivalAt,
        destination: row.destinationName,
        status: t("dashboard." + row.status),
      },
      port: { name: row.destinationName },
      summary: { description: t("dashboard.mock") },
      companies: [],
    };
    return (
      <Link
        to={nav.to}
        state={nav.state}
        aria-label={t("dashboard.details") + ": " + row.vehicleTitle}
        className="inline-flex size-8 items-center justify-center rounded-md text-primary hover:bg-primary/10"
      >
        <Eye className="size-4" />
      </Link>
    );
  }
  return (
    <Card className="gap-0 py-0 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <h2 className="text-sm font-semibold">
            {t(
              "dashboard." +
                (tab === "parkings"
                  ? "parkingTable"
                  : tab === "reports"
                    ? "reportTable"
                    : "latest"),
            )}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground" role="status">
            {formatNumber(pagination.totalItems)} {t("dashboard.results")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              className="w-56 ps-9"
              value={filters.search ?? ""}
              aria-label={t("dashboard.search")}
              placeholder={t("dashboard.search")}
              onChange={(event) => onChange({ search: event.target.value })}
            />
          </div>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" size="sm" />}>
              <Columns3 className="size-4" />
              {t("dashboard.columns")}
            </PopoverTrigger>
            <PopoverContent
              dir={direction}
              align="end"
              className="z-[11000] max-h-80 overflow-y-auto"
            >
              <PopoverTitle>{t("dashboard.columns")}</PopoverTitle>
              <PopoverDescription>
                {t("Choose fields shown in the table.")}
              </PopoverDescription>
              {columns.map((column) => (
                <label
                  key={column.key}
                  className="flex cursor-pointer items-center gap-2 py-1.5"
                >
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={visibleColumns.includes(column.key)}
                    disabled={
                      visibleColumns.length === 1 &&
                      visibleColumns.includes(column.key)
                    }
                    onChange={(event) =>
                      onColumnsChange(
                        event.target.checked
                          ? [...visibleColumns, column.key]
                          : visibleColumns.filter((key) => key !== column.key),
                      )
                    }
                  />
                  {t("dashboard." + column.label)}
                </label>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div aria-busy={fetching} className={fetching ? "opacity-60" : ""}>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              {shown.map((column) => (
                <TableHead
                  key={column.key}
                  aria-sort={
                    filters.sortBy === column.key
                      ? filters.sortOrder === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    className="flex items-center gap-1.5 whitespace-nowrap py-2"
                    onClick={() =>
                      onChange({
                        sortBy: column.key,
                        sortOrder:
                          filters.sortBy === column.key &&
                          filters.sortOrder === "desc"
                            ? "asc"
                            : "desc",
                      })
                    }
                  >
                    {t("dashboard." + column.label)}
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </button>
                </TableHead>
              ))}
              {tab === "vehicles" && (
                <TableHead>{t("dashboard.details")}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.id}>
                {shown.map((column) => (
                  <TableCell key={column.key}>
                    {column.key === "status" ? (
                      <Badge
                        variant="outline"
                        className={
                          row.delayed
                            ? "border-amber-300 bg-amber-500/10 text-amber-700"
                            : row.completed
                              ? "border-emerald-300 bg-emerald-500/10 text-emerald-700"
                              : "border-primary/20 bg-primary/5 text-primary"
                        }
                      >
                        {cellValue(row, column.key, context)}
                      </Badge>
                    ) : column.key === "parkingName" && tab === "parkings" ? (
                      <Link
                        to={
                          "/port?mock=dashboard&name=" +
                          encodeURIComponent(row.parkingName)
                        }
                        state={{
                          dashboardMock: response.data.options.parkings.filter(
                            (parking) => parking.id === row.id,
                          ),
                        }}
                        className="font-medium text-primary hover:underline"
                        title={t("dashboard.parkingDetails")}
                      >
                        {cellValue(row, column.key, context)}
                      </Link>
                    ) : (
                      cellValue(row, column.key, context)
                    )}
                  </TableCell>
                ))}
                {tab === "vehicles" && <TableCell>{details(row)}</TableCell>}
              </TableRow>
            ))}
            {!items.length && (
              <TableRow>
                <TableCell
                  colSpan={shown.length + (tab === "vehicles" ? 1 : 0)}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t("dashboard.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-xs">
        <label className="flex items-center gap-2 text-muted-foreground">
          {t("dashboard.rowsPerPage")}
          <select
            className="rounded-md border bg-background px-2 py-1"
            value={pagination.pageSize}
            onChange={(event) =>
              onChange({ pageSize: Number(event.target.value) })
            }
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {formatNumber(size)}
              </option>
            ))}
          </select>
        </label>
        <span>
          {t("dashboard.page")} {formatNumber(pagination.page)}{" "}
          {t("dashboard.of")} {formatNumber(pagination.totalPages)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1 || fetching}
            onClick={() => onChange({ page: pagination.page - 1 }, false)}
          >
            <ChevronRight className="size-4 ltr:rotate-180" />
            {t("dashboard.previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages || fetching}
            onClick={() => onChange({ page: pagination.page + 1 }, false)}
          >
            {t("dashboard.next")}
            <ChevronLeft className="size-4 ltr:rotate-180" />
          </Button>
        </div>
      </footer>
    </Card>
  );
}
