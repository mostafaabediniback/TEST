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
  X,
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
  { key: "ship_id", labelKey: "shipId" },
  { key: "departure_port_id", labelKey: "departurePortId" },
  { key: "departure_time", labelKey: "departureTime" },
  { key: "arrival_port_id", labelKey: "arrivalPortId" },
  { key: "arrival_time", labelKey: "arrivalTime" },
];

function formatTimestamp(value, formatNumber) {
  if (value == null) return null;

  const date = new Date(value * 1000);

  if (Number.isNaN(date.getTime())) {
    return formatNumber(value);
  }

  return date.toLocaleString();
}

export default function Voyage() {
  const { t, formatNumber, direction } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const savedTable = location.state?.tableState;
  const [filter, setFilter] = useState(savedTable?.filter ?? "");
  const [page, setPage] = useState(savedTable?.page ?? 1);
  const [pageSize, setPageSize] = useState(savedTable?.pageSize ?? 20);
  const [visibleColumns, setVisibleColumns] = useState(
    savedTable?.visibleColumns ?? columns.map((column) => column.key)
  );

  // The API has no general text-search parameter, so use the entered value
  // as a ship_id filter when it is a valid integer.
  const shipIdFilter = filter.trim() && /^\d+$/.test(filter.trim())
    ? Number(filter.trim())
    : undefined;

  const { data, isPending, isError, error } = useVoyages({
    page,
    page_size: pageSize,
    ship_id: shipIdFilter,
    sort_by: "id",
    sort_order: "desc",
  });

  const rows = data?.items ?? data?.results ?? data?.data ?? [];
  const total = data?.total ?? data?.count ?? rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const displayedColumns = columns.filter((column) =>
    visibleColumns.includes(column.key)
  );

  function showDetails(voyage) {
    const tableState = { filter, page, pageSize, visibleColumns };
    const returnTo = location.pathname + location.search;
    navigate(returnTo, { replace: true, state: { ...location.state, tableState } });
    const target = getShipDetailsNavigation({ id: voyage.ship_id }, { source: "table", returnTo, tableState });
    navigate(target.to, { state: target.state });
  }

  function handleFilterChange(event) {
    setFilter(event.target.value);
    setPage(1);
  }

  function toggleColumn(key, checked) {
    setVisibleColumns((current) =>
      checked
        ? [...current, key]
        : current.filter((column) => column !== key)
    );
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              inputMode="numeric"
              value={filter}
              onChange={handleFilterChange}
              placeholder={t("filterVoyagesPlaceholder")}
              aria-label={t("filterVoyagesLabel")}
              className="h-10 bg-background ps-10 pe-10"
            />
            {filter && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("clearFilter")}
                className="absolute end-1.5 top-1/2 -translate-y-1/2"
                onClick={() => {
                  setFilter("");
                  setPage(1);
                }}
              >
                <X aria-hidden="true" />
              </Button>
            )}
          </div>

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
                    <span>{t(column.labelKey)}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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
                  {displayedColumns.map(({ key, labelKey }) => (
                    <TableHead key={key}>{t(labelKey)}</TableHead>
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
                              {formatNumber(displayValue)}
                            </Badge>
                          ) : typeof displayValue === "number" ? (
                            formatNumber(displayValue)
                          ) : (
                            displayValue
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" disabled={voyage.ship_id == null} aria-label={t("viewDetails") + ": " + (voyage.name ?? voyage.ship_id)} onClick={() => showDetails(voyage)}>
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
