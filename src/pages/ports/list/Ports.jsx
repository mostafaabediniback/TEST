import { useState } from "react";
import { Anchor } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/context/LocaleContext";
import { usePorts } from "@/hooks/usePorts";

import PortsFilters from "./components/PortsFilters";
import PortsColumnsMenu from "./components/PortsColumnsMenu";
import PortsTable from "./components/PortsTable";
import PortsPagination from "@/components/ports/PortsPagination";
import {
  columns,
  emptyFilters,
  optionalValue,
} from "./portsConstants";

export default function Ports() {
  const { t, direction } = useLocale();

  const [filters, setFilters] = useState({ ...emptyFilters });
  const [appliedFilters, setAppliedFilters] = useState({ ...emptyFilters });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((column) => column.key),
  );

  const { data, isPending, isError, error } = usePorts({
    page,
    page_size: pageSize,

    id: optionalValue(appliedFilters.id),
    country_code: optionalValue(appliedFilters.country_code),
    timezone: optionalValue(appliedFilters.timezone),
    name: optionalValue(appliedFilters.name),
    alternative_name: optionalValue(appliedFilters.alternative_name),
    unlo_code: optionalValue(appliedFilters.unlo_code),
    country_name: optionalValue(appliedFilters.country_name),
    gallery_url: optionalValue(appliedFilters.gallery_url),

    lon_min: optionalValue(appliedFilters.lon_min),
    lon_max: optionalValue(appliedFilters.lon_max),
    lat_min: optionalValue(appliedFilters.lat_min),
    lat_max: optionalValue(appliedFilters.lat_max),

    create_time_from: optionalValue(appliedFilters.create_time_from),
    create_time_to: optionalValue(appliedFilters.create_time_to),
    update_time_from: optionalValue(appliedFilters.update_time_from),
    update_time_to: optionalValue(appliedFilters.update_time_to),

    sort_by: "id",
    sort_order: "asc",
  });

  const rows = data?.items ?? data?.results ?? data?.data ?? [];
  const total = data?.total ?? data?.count ?? rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const displayedColumns = columns.filter((column) =>
    visibleColumns.includes(column.key),
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
      checked ? [...current, key] : current.filter((column) => column !== key),
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
            <Anchor className="size-5" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-xl font-semibold">{t("ports")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("portsDescription")}
            </p>
          </div>
        </header>

        <PortsFilters
          filters={filters}
          onFilterChange={updateFilter}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        <PortsColumnsMenu
          columns={columns}
          visibleColumns={visibleColumns}
          onToggle={toggleColumn}
        />

        <Card className="py-0">
          <PortsTable
            rows={rows}
            columns={displayedColumns}
            isPending={isPending}
            isError={isError}
            error={error}
          />
        </Card>

        <PortsPagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          total={total}
          isPending={isPending}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </section>
  );
}
