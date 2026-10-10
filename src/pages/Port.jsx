import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Search,
  Anchor,
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
import { usePorts } from "@/hooks/usePorts";

const columns = [
  { key: "name", labelKey: "name" },
  { key: "unlo_code", labelKey: "unloCode" },
  { key: "country_name", labelKey: "country" },
  { key: "country_code", labelKey: "countryCode" },
  { key: "timezone", labelKey: "timezone" },
  { key: "lon", labelKey: "longitude" },
  { key: "lat", labelKey: "latitude" },
];

export default function Port() {
  const { t, formatNumber, direction } = useLocale();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const mockParkings =
    location.state?.dashboardMock ??
    (searchParams.get("mock") === "dashboard" ? [] : undefined);
  const [filter, setFilter] = useState(searchParams.get("name") ?? "");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((column) => column.key),
  );

  const portsQuery = usePorts(
    {
      page,
      page_size: pageSize,
      name: filter.trim() || undefined,
      sort_by: "id",
      sort_order: "asc",
    },
    { enabled: !mockParkings },
  );
  const mockRows = mockParkings?.filter((row) =>
    row.name.includes(filter.trim()),
  );
  const { data, isPending, isError, error } = mockParkings
    ? {
        data: {
          items: mockRows.slice((page - 1) * pageSize, page * pageSize),
          total: mockRows.length,
        },
        isPending: false,
        isError: false,
        error: null,
      }
    : portsQuery;

  const rows = data?.items ?? data?.results ?? data?.data ?? [];
  const total = data?.total ?? data?.count ?? rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const displayedColumns = columns.filter((column) =>
    visibleColumns.includes(column.key),
  );

  function handleFilterChange(event) {
    setFilter(event.target.value);
    setPage(1);
  }

  function toggleColumn(key, checked) {
    setVisibleColumns((current) =>
      checked ? [...current, key] : current.filter((column) => column !== key),
    );
  }

  return (
    <section
      dir={direction}
      style={mockParkings ? { paddingTop: 80 } : undefined}
      className="h-full overflow-y-auto bg-muted/30 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
            <Anchor className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t("ports")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("portsDescription")}
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
              value={filter}
              onChange={handleFilterChange}
              placeholder={t("filterPortsPlaceholder")}
              aria-label={t("filterPortsLabel")}
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
                      disabled={column.key === "name"}
                      onChange={(event) =>
                        toggleColumn(column.key, event.target.checked)
                      }
                      className="size-4 accent-primary disabled:cursor-not-allowed"
                    />
                    <span>{t(column.labelKey)}</span>
                    {column.key === "name" && (
                      <span className="ms-auto text-xs text-muted-foreground">
                        {t("Required")}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Card className="py-0">
          {isPending ? (
            <p className="p-6 text-sm text-muted-foreground">
              {t("loadingPorts")}
            </p>
          ) : isError ? (
            <p className="p-6 text-sm text-destructive">
              {error?.message ?? t("loadPortsError")}
            </p>
          ) : rows.length ? (
            <Table>
              <TableHeader dir={direction} className="bg-muted/50">
                <TableRow>
                  {displayedColumns.map(({ key, labelKey }) => (
                    <TableHead key={key}>{t(labelKey)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((port) => (
                  <TableRow key={port.id}>
                    {displayedColumns.map(({ key }) => (
                      <TableCell
                        key={key}
                        className={key === "name" ? "font-medium" : undefined}
                      >
                        {port[key] == null || port[key] === "" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : key === "unlo_code" || key === "country_code" ? (
                          <Badge variant="outline">{port[key]}</Badge>
                        ) : typeof port[key] === "number" ? (
                          formatNumber(port[key])
                        ) : (
                          port[key]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {t("noPortsFound")}
            </p>
          )}
        </Card>

        <footer className="flex flex-col gap-4 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="ports-page-size" className="text-sm">
              {t("rowsPerPage")}
            </label>
            <select
              id="ports-page-size"
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
