import { useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Navigation } from "lucide-react";

import { getShipDetailsNavigation } from "@/lib/shipNavigation";
import { toUnixSeconds } from "@/lib/dateTime";
import { useLocale } from "@/context/LocaleContext";
import { useVoyages } from "@/hooks/useVoyages";
import { columns, emptyFilters } from "./voyagesConstants";
import { savedDateRange, toOptionalNumber } from "./voyagesUtils";
import VoyagesFilters from "./components/VoyagesFilters";
import VoyagesColumnsMenu from "./components/VoyagesColumnsMenu";
import VoyagesTable from "./components/VoyagesTable";
import VoyagesPagination from "./components/VoyagesPagination";

export default function Voyages() {
  const { t, direction } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const savedTable = location.state?.tableState;

  const filterKeys = [
    "id",
    "ship_id",
    "departure_port_id",
    "arrival_port_id",
    "ship_type",
    "ship_subtype",
    "departure_time_from",
    "departure_time_to",
    "arrival_time_from",
    "arrival_time_to",
  ];

  // Use URL filters first; otherwise restore filters from navigation state.
  const urlFilters = Object.fromEntries(
    filterKeys
      .filter((key) => searchParams.has(key))
      .map((key) => [key, searchParams.get(key)]),
  );

  // The vessel subtype dropdown uses an array.
  if (urlFilters.ship_subtype) {
    urlFilters.ship_subtype = urlFilters.ship_subtype
      .split(",")
      .filter(Boolean);
  }

  const savedFilters = {
    ...emptyFilters,
    ...(savedTable?.filters ?? {}),
    ...urlFilters,
  };

  const [filters, setFilters] = useState(savedFilters);
  const [appliedFilters, setAppliedFilters] = useState(savedFilters);

  const [departureRange, setDepartureRange] = useState(() =>
    savedDateRange(savedFilters, "departure"),
  );
  const [appliedDepartureRange, setAppliedDepartureRange] = useState(() =>
    savedDateRange(savedFilters, "departure"),
  );

  const [arrivalRange, setArrivalRange] = useState(() =>
    savedDateRange(savedFilters, "arrival"),
  );
  const [appliedArrivalRange, setAppliedArrivalRange] = useState(() =>
    savedDateRange(savedFilters, "arrival"),
  );

  const [page, setPage] = useState(savedTable?.page ?? 1);
  const [pageSize, setPageSize] = useState(savedTable?.pageSize ?? 20);
  const [visibleColumns, setVisibleColumns] = useState(
    savedTable?.visibleColumns ?? columns.map((column) => column.key),
  );

  const { data, isPending, isError, error } = useVoyages({
    page,
    page_size: pageSize,
    id: toOptionalNumber(appliedFilters.id),
    ship_id: toOptionalNumber(appliedFilters.ship_id),
    departure_port_id: toOptionalNumber(appliedFilters.departure_port_id),
    arrival_port_id: toOptionalNumber(appliedFilters.arrival_port_id),

    // Vessel type filters
    ship_type: appliedFilters.ship_type || undefined,
    ship_subtype: appliedFilters.ship_subtype?.length
      ? appliedFilters.ship_subtype
      : undefined,

    departure_time_from: toUnixSeconds(appliedDepartureRange.from),
    departure_time_to: toUnixSeconds(appliedDepartureRange.to),
    arrival_time_from: toUnixSeconds(appliedArrivalRange.from),
    arrival_time_to: toUnixSeconds(appliedArrivalRange.to),
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

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (key === "ship_subtype") {
        if (value?.length) {
          params.set(key, value.join(","));
        }
        return;
      }

      if (value !== "" && value != null) {
        params.set(key, String(value));
      }
    });

    const dateFilters = {
      departure_time_from: toUnixSeconds(departureRange.from),
      departure_time_to: toUnixSeconds(departureRange.to),
      arrival_time_from: toUnixSeconds(arrivalRange.from),
      arrival_time_to: toUnixSeconds(arrivalRange.to),
    };

    Object.entries(dateFilters).forEach(([key, value]) => {
      if (value != null) {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
    setPage(1);
    setAppliedFilters({ ...filters });
    setAppliedDepartureRange({ ...departureRange });
    setAppliedArrivalRange({ ...arrivalRange });
  }

  function handleReset() {
    setFilters({ ...emptyFilters });
    setAppliedFilters({ ...emptyFilters });
    setDepartureRange({});
    setAppliedDepartureRange({});
    setArrivalRange({});
    setAppliedArrivalRange({});
    setPage(1);
    setSearchParams({});
  }

  function toggleColumn(key, checked) {
    setVisibleColumns((current) =>
      checked
        ? [...current, key]
        : current.filter((column) => column !== key),
    );
  }

  function showDetails(voyage) {
    const tableState = {
      filters: {
        ...filters,
        departure_time_from: toUnixSeconds(departureRange.from),
        departure_time_to: toUnixSeconds(departureRange.to),
        arrival_time_from: toUnixSeconds(arrivalRange.from),
        arrival_time_to: toUnixSeconds(arrivalRange.to),
      },
      page,
      pageSize,
      visibleColumns,
    };

    const returnTo = location.pathname + location.search;

    const target = getShipDetailsNavigation(
      { id: voyage.ship_id },
      { source: "table", returnTo, tableState },
    );

    navigate(target.to, { state: target.state });
  }

  return (
    <section
      dir={direction}
      className="h-full overflow-y-auto bg-muted/30 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
            <Navigation className="size-5" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-xl font-semibold">{t("voyages")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("voyagesDescription")}
            </p>
          </div>
        </header>

        <VoyagesFilters
          filters={filters}
          departureRange={departureRange}
          arrivalRange={arrivalRange}
          updateFilter={updateFilter}
          setDepartureRange={setDepartureRange}
          setArrivalRange={setArrivalRange}
          handleSearch={handleSearch}
          handleReset={handleReset}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            <VoyagesColumnsMenu
              displayedColumns={displayedColumns}
              visibleColumns={visibleColumns}
              toggleColumn={toggleColumn}
            />
          </div>
        </div>

        <VoyagesTable
          rows={rows}
          displayedColumns={displayedColumns}
          isPending={isPending}
          isError={isError}
          error={error}
          showDetails={showDetails}
        />

        <VoyagesPagination
          page={page}
          pageSize={pageSize}
          pageCount={pageCount}
          total={total}
          isPending={isPending}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </div>
    </section>
  );
}