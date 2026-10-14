import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getShipDetailsNavigation } from "@/lib/shipNavigation";
import { getVesselTypeFilter } from "@/lib/vesselTypes";
import { Ship } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/context/LocaleContext";
import { useShips } from "@/hooks/useShips";

import ShipsFilters from "@/components/ships/ShipsFilters";
import ShipsColumnsMenu from "@/components/ships/ShipsColumnsMenu";
import ShipsTable from "@/components/ships/ShipsTable";
import ShipsPagination from "@/components/ships/ShipsPagination";
import { columns, emptyFilters, filtersToValue } from "@/components/ships/shipsConstants";

export default function Ships() {
  const { t, direction } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const savedTable = location.state?.tableState;

  const [page, setPage] = useState(savedTable?.page ?? 1);
  const [pageSize, setPageSize] = useState(savedTable?.pageSize ?? 20);
  const [visibleColumns, setVisibleColumns] = useState(
    savedTable?.visibleColumns ?? columns.map((column) => column.key)
  );
  const [filters, setFilters] = useState({
    ...emptyFilters,
    ...(savedTable?.filters ?? {}),
    vessel_type: savedTable?.filters?.vessel_type ?? [],
  });
  const [appliedFilters, setAppliedFilters] = useState({
    ...emptyFilters,
    ...(savedTable?.filters ?? {}),
    vessel_type: savedTable?.filters?.vessel_type ?? [],
  });

  const { data, isPending, isError, error } = useShips({
    page,
    page_size: pageSize,
    name: filtersToValue(appliedFilters.name),
    imo: filtersToValue(appliedFilters.imo),
    flag: filtersToValue(appliedFilters.flag),
    vessel_type: getVesselTypeFilter(appliedFilters.vessel_type),
    vessel_class: filtersToValue(appliedFilters.vessel_class),
    vessel_maker: filtersToValue(appliedFilters.vessel_maker),
    yob_from: filtersToValue(appliedFilters.yob_from),
    yob_to: filtersToValue(appliedFilters.yob_to),
    loa_min: filtersToValue(appliedFilters.loa_min),
    loa_max: filtersToValue(appliedFilters.loa_max),
    width_min: filtersToValue(appliedFilters.width_min),
    width_max: filtersToValue(appliedFilters.width_max),
    draft_min: filtersToValue(appliedFilters.draft_min),
    draft_max: filtersToValue(appliedFilters.draft_max),
    dwt_min: filtersToValue(appliedFilters.dwt_min),
    dwt_max: filtersToValue(appliedFilters.dwt_max),
    sort_by: "id",
    sort_order: "desc",
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

  function showDetails(ship) {
    const tableState = { filters, page, pageSize, visibleColumns };
    const target = getShipDetailsNavigation(ship, {
      source: "table",
      returnTo: location.pathname + location.search,
      tableState,
    });

    navigate(target.to, { state: target.state });
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
            <h2 className="text-xl font-semibold">{t("ships")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("shipsDescription")}
            </p>
          </div>
        </header>

        <ShipsFilters
          filters={filters}
          onFilterChange={updateFilter}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        <ShipsColumnsMenu
          columns={columns}
          visibleColumns={visibleColumns}
          onToggle={toggleColumn}
        />

        <Card className="py-0">
          <ShipsTable
            rows={rows}
            columns={displayedColumns}
            isPending={isPending}
            isError={isError}
            error={error}
            onViewDetails={showDetails}
          />
        </Card>

        <ShipsPagination
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