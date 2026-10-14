import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getShipDetailsNavigation } from "@/lib/shipNavigation";
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Eye,
  Search,
  Ship,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/context/LocaleContext";
import { useVoyages } from "@/hooks/useVoyages";

const columns = [
  { key: "id", label: "Voyage ID" },
  { key: "ship_id", labelKey: "shipId" },
  { key: "departure_port_id", labelKey: "departurePortId" },
  { key: "departure_time", labelKey: "departureTime" },
  { key: "arrival_port_id", labelKey: "arrivalPortId" },
  { key: "arrival_time", labelKey: "arrivalTime" },
];

const emptyFilters = {
  id: "",
  ship_id: "",
  departure_port_id: "",
  arrival_port_id: "",
  departure_time_from: "",
  departure_time_to: "",
  arrival_time_from: "",
  arrival_time_to: "",
};

function formatTimestamp(value, formatNumber) {
  if (value == null) return null;

  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime())
    ? formatNumber(value)
    : date.toLocaleString();
}

function toOptionalNumber(value) {
  if (value === "" || value == null) return undefined;

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export default function Voyages() {
  const { t, formatNumber, direction } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const savedTable = location.state?.tableState;

  const [filters, setFilters] = useState({
    ...emptyFilters,
    ...(savedTable?.filters ?? {}),
  });
  const [appliedFilters, setAppliedFilters] = useState({
    ...emptyFilters,
    ...(savedTable?.filters ?? {}),
  });
  const [page, setPage] = useState(savedTable?.page ?? 1);
  const [pageSize, setPageSize] = useState(savedTable?.pageSize ?? 20);
  const [visibleColumns, setVisibleColumns] = useState(
    savedTable?.visibleColumns ?? columns.map((column) => column.key)
  );

  const { data, isPending, isError, error } = useVoyages({
    page,
    page_size: pageSize,
    id: toOptionalNumber(appliedFilters.id),
    ship_id: toOptionalNumber(appliedFilters.ship_id),
    departure_port_id: toOptionalNumber(appliedFilters.departure_port_id),
    arrival_port_id: toOptionalNumber(appliedFilters.arrival_port_id),
    departure_time_from: toOptionalNumber(appliedFilters.departure_time_from),
    departure_time_to: toOptionalNumber(appliedFilters.departure_time_to),
    arrival_time_from: toOptionalNumber(appliedFilters.arrival_time_from),
    arrival_time_to: toOptionalNumber(appliedFilters.arrival_time_to),
  });

  const rows = data?.items ?? data?.results ?? data?.data ?? [];
  const total = data?.total ?? data?.count ?? rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const displayedColumns = columns.filter((column) =>
    visibleColumns.includes(column.key)
  );

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  }

  function handleReset() {
    setFilters({ ...emptyFilters });
    setAppliedFilters({ ...emptyFilters });
    setPage(1);
  }

  function toggleColumn(key, checked) {
    setVisibleColumns((current) =>
      checked
        ? [...current, key]
        : current.filter((column) => column !== key)
    );
  }

  function showDetails(voyage) {
    const tableState = {
      filters,
      page,
      pageSize,
      visibleColumns,
    };
    const returnTo = location.pathname + location.search;
    const target = getShipDetailsNavigation(
      { id: voyage.ship_id },
      { source: "table", returnTo, tableState }
    );

    navigate(target.to, { state: target.state });
  }

  return (
    <section
      dir={direction}
      className="h-full overflow-y-auto bg-muted/30 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
            <Ship className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t("voyages")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("voyagesDescription")}
            </p>
          </div>
        </header>

        <Card className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterInput
                label="Voyage ID"
                value={filters.id}
                onChange={(value) => updateFilter("id", value)}
              />
              <FilterInput
                label={t("shipId")}
                value={filters.ship_id}
                onChange={(value) => updateFilter("ship_id", value)}
              />
              <FilterInput
                label={t("departurePortId")}
                value={filters.departure_port_id}
                onChange={(value) => updateFilter("departure_port_id", value)}
              />
              <FilterInput
                label={t("arrivalPortId")}
                value={filters.arrival_port_id}
                onChange={(value) => updateFilter("arrival_port_id", value)}
              />
              <FilterInput
                label={`${t("departureTime")} — from (Unix seconds)`}
                value={filters.departure_time_from}
                onChange={(value) =>
                  updateFilter("departure_time_from", value)
                }
              />
              <FilterInput
                label={`${t("departureTime")} — to (Unix seconds)`}
                value={filters.departure_time_to}
                onChange={(value) => updateFilter("departure_time_to", value)}
              />
              <FilterInput
                label={`${t("arrivalTime")} — from (Unix seconds)`}
                value={filters.arrival_time_from}
                onChange={(value) => updateFilter("arrival_time_from", value)}
              />
              <FilterInput
                label={`${t("arrivalTime")} — to (Unix seconds)`}
                value={filters.arrival_time_to}
                onChange={(value) => updateFilter("arrival_time_to", value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit">
                <Search aria-hidden="true" />
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset filters
              </Button>
            </div>
          </form>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {formatNumber(total)} {t("voyages")}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger
                render={<Button variant="outline" className="h-10" />}
              >
                <Columns3 aria-hidden="true" />
                {t("Columns")} ({formatNumber(displayedColumns.length)}/
                {formatNumber(columns.length)})
              </PopoverTrigger>
              <PopoverContent
                align="end"
                dir={direction}
                className="w-64 max-w-[calc(100vw-2rem)] text-start"
              >
                <PopoverTitle>{t("Visible columns")}</PopoverTitle>
                <PopoverDescription>
                  {t("Choose fields shown in the table.")}
                </PopoverDescription>
                <div className="space-y-1">
                  {columns.map((column) => (
                    <label
                      key={column.key}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column.key)}
                        onChange={(event) =>
                          toggleColumn(column.key, event.target.checked)
                        }
                        className="size-4 accent-primary"
                      />
                      <span>
                        {column.labelKey ? t(column.labelKey) : column.label}
                      </span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Card className="py-0">
          {isPending ? (
            <p className="p-6 text-sm text-muted-foreground">
              {t("loadingVoyages")}
            </p>
          ) : isError ? (
            <p className="p-6 text-sm text-destructive">
              {error?.message ?? t("loadVoyagesError")}
            </p>
          ) : rows.length ? (
            <Table>
              <TableHeader dir={direction} className="bg-muted/50">
                <TableRow>
                  {displayedColumns.map((column) => (
                    <TableHead key={column.key}>
                      {column.labelKey ? t(column.labelKey) : column.label}
                    </TableHead>
                  ))}
                  <TableHead>{t("viewDetails")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((voyage) => (
                  <TableRow key={voyage.id}>
                    {displayedColumns.map(({ key }) => {
                      const value = voyage[key];
                      const displayValue =
                        key === "departure_time" || key === "arrival_time"
                          ? formatTimestamp(value, formatNumber)
                          : value;

                      return (
                        <TableCell key={key}>
                          {displayValue == null || displayValue === "" ? (
                            <span className="text-muted-foreground">—</span>
                          ) : key === "ship_id" ? (
                            <Badge variant="outline">
                              {(displayValue)}
                            </Badge>
                          ) : typeof displayValue === "number" ? (
                            (displayValue)
                          ) : (
                            displayValue
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={voyage.ship_id == null}
                        aria-label={`${t("viewDetails")}: ${
                          voyage.name ?? voyage.ship_id
                        }`}
                        onClick={() => showDetails(voyage)}
                      >
                        <Eye aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {t("noVoyagesFound")}
            </p>
          )}
        </Card>

        <footer className="flex flex-col gap-4 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="voyages-page-size" className="text-sm">
              {t("rowsPerPage")}
            </label>
            <select
              id="voyages-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {formatNumber(size)}
                </option>
              ))}
            </select>

            <span className="text-xs text-muted-foreground" role="status">
              {t("pageOfPagesTotal", {
                page: formatNumber(page),
                pages: formatNumber(pageCount),
                total: formatNumber(total),
              })}
            </span>
          </div>

          <nav aria-label={t("pagination")} className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft className="rtl:rotate-180" aria-hidden="true" />
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount || isPending}
              onClick={() => setPage((current) => current + 1)}
            >
              {t("next")}
              <ChevronRight className="rtl:rotate-180" aria-hidden="true" />
            </Button>
          </nav>
        </footer>
      </div>
    </section>
  );
}

function FilterInput({ label, value, onChange }) {
  return (
    <label className="block min-w-0 space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <Input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="—"
      />
    </label>
  );
}