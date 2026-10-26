import { usePageState, usePageScroll } from "@/hooks/usePageReturn";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { getShipDetailsNavigation } from "@/lib/shipNavigation";
import { getVesselTypeFilter } from "@/lib/vesselTypes";
import { Ship } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useLocale } from "@/context/LocaleContext";
import { useShips } from "@/hooks/useShips";

import ShipsFilters from "./components/ShipsFilters";
import ShipsColumnsMenu from "./components/ShipsColumnsMenu";
import ShipsTable from "./components/ShipsTable";
import ShipsPagination from "./components/ShipsPagination";
import { columns, emptyFilters, filtersToValue } from "./shipsConstants";

function imoToApiValue(status) {
  if (status === "has_imo") return -1;
  if (status === "no_imo") return 0;
  return undefined;
}

function getImoApiValue(filters) {
  const typedImo = filtersToValue(filters.imo);
  return typedImo || imoToApiValue(filters.imo_status);
}

function filtersFromSearchParams(searchParams, fallback = {}) {
  const result = {
    ...emptyFilters,
    ...fallback,
    imo_status: fallback.imo_status ?? "any",
    vessel_type: fallback.vessel_type ?? [],
  };

  for (const key of Object.keys(emptyFilters)) {
    const values = searchParams.getAll(key);

    if (key === "vessel_type") {
      if (values.length > 0) result[key] = values;
    } else if (values.length > 0) {
      result[key] = values[0];
    }
  }

  // These filters may not be included in emptyFilters.
  const imoStatus = searchParams.get("imo_status");
  if (imoStatus !== null) result.imo_status = imoStatus;

  const vesselTypes = searchParams.getAll("vessel_type");
  if (vesselTypes.length > 0) result.vessel_type = vesselTypes;

  return result;
}

export default function Ships() {
  const { t, direction } = useLocale();
  const scrollRef = usePageScroll("table");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const savedTable = location.state?.tableState;
  const savedFilters = savedTable?.filters;

  const initialFilters = filtersFromSearchParams(searchParams, savedFilters);

  const [page, setPage] = usePageState("page", savedTable?.page ?? 1);
  const [pageSize, setPageSize] = usePageState("pageSize", savedTable?.pageSize ?? 20);
  const [visibleColumns, setVisibleColumns] = usePageState("visibleColumns", 
    savedTable?.visibleColumns ?? columns.map((column) => column.key),
  );

  const [filters, setFilters] = usePageState("filters", initialFilters);
  const [appliedFilters, setAppliedFilters] = usePageState("appliedFilters", initialFilters);

  function writeFiltersToUrl(nextFilters) {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        const filterKeys = new Set([
          ...Object.keys(emptyFilters),
          "imo_status",
          "vessel_type",
        ]);

        // Remove old filter values but preserve unrelated query parameters.
        for (const key of filterKeys) {
          nextParams.delete(key);
        }

        for (const [key, value] of Object.entries(nextFilters)) {
          if (!filterKeys.has(key)) continue;

          if (Array.isArray(value)) {
            value.forEach((item) => {
              if (item !== "" && item != null) {
                nextParams.append(key, String(item));
              }
            });
          } else if (value !== "" && value != null && value !== "any") {
            nextParams.set(key, String(value));
          }
        }

        return nextParams;
      },
      { replace: true },
    );
  }

  const { data, isPending, isError, error } = useShips({
    page,
    page_size: pageSize,
    name: filtersToValue(appliedFilters.name),
    imo: getImoApiValue(appliedFilters),
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
    visibleColumns.includes(column.key),
  );

  function updateFilter(key, value) {
    if (key === "imo") {
      const nextFilters = {
        ...filters,
        imo: value,
        imo_status: "any",
      };

      const nextAppliedFilters = {
        ...appliedFilters,
        imo: value,
        imo_status: "any",
      };

      setFilters(nextFilters);
      setAppliedFilters(nextAppliedFilters);
      writeFiltersToUrl(nextAppliedFilters);
      setPage(1);
      return;
    }

    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
    writeFiltersToUrl(filters);
  }

  function handleReset() {
    const resetFilters = {
      ...emptyFilters,
      imo_status: "any",
      vessel_type: [],
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    writeFiltersToUrl(resetFilters);
    setPage(1);
  }

  function handleImoStatusChange(status) {
    const nextFilters = {
      ...filters,
      imo: "",
      imo_status: status,
    };

    const nextAppliedFilters = {
      ...appliedFilters,
      imo: "",
      imo_status: status,
    };

    setFilters(nextFilters);
    setAppliedFilters(nextAppliedFilters);
    writeFiltersToUrl(nextAppliedFilters);
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
        : current.filter((column) => column !== key),
    );
  }

  return (
    <section
      ref={scrollRef}
      dir={direction}
      className="h-full overflow-y-auto bg-muted/30 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-7xl space-y-5">
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
            filters={filters}
            onImoStatusChange={handleImoStatusChange}
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
