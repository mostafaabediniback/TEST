import { formatTimestamp, toUnixSeconds } from "@/lib/dateTime";
import { useState } from "react";
import { Search, Ship } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePortVoyagesList } from "@/hooks/usePortVoyagesList";
import PortsPagination from "@/components/ports/PortsPagination";
import VesselTypeDropdown from "@/components/ships/VesselTypeDropdown";
import CountryDropdown from "@/components/ships/CountryDropdown";
import { VesselFlag } from "@/components/VesselFlag";
import DateRangeFilter from "@/components/DateRangeFilter";
import { Link, useSearchParams } from "react-router-dom";

const EMPTY_FILTERS = {
  departure_time_from: "",
  departure_time_to: "",
  vessel_type: [],
  vessel_flag: "",
};

function parseUrlDate(value) {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function dateToUrl(value) {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

const ExpectedArrivalsTab = ({ port, portId }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(
    Math.max(1, Number(searchParams.get("page")) || 1),
  );
  const [pageSize, setPageSize] = useState(
    Math.max(1, Number(searchParams.get("page_size")) || 20),
  );

  const initialSearch = searchParams.get("vessel_name") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);

  const initialDateRange = {
    from: parseUrlDate(searchParams.get("arrival_from")),
    to: parseUrlDate(searchParams.get("arrival_to")),
  };
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [appliedDateRange, setAppliedDateRange] = useState(initialDateRange);

  const initialFilters = {
    ...EMPTY_FILTERS,
    departure_time_from: searchParams.get("departure_time_from") ?? "",
    departure_time_to: searchParams.get("departure_time_to") ?? "",
    vessel_type: searchParams.getAll("vessel_type"),
    vessel_flag: searchParams.get("vessel_flag") ?? "",
  };
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const queryFilters = {
    page,
    page_size: pageSize,
    port_type: "arrival",
    arrival_type: "expected",
    sort_by: "id",
    sort_order: "asc",
    vessel_name: appliedSearch.trim() || undefined,
    arrival_time_from: toUnixSeconds(appliedDateRange.from),
    arrival_time_to: toUnixSeconds(appliedDateRange.to),
    departure_time_from: toUnixSeconds(
      appliedFilters.departure_time_from,
    ),
    departure_time_to: toUnixSeconds(appliedFilters.departure_time_to),
    vessel_type: appliedFilters.vessel_type.length
      ? appliedFilters.vessel_type
      : undefined,
    vessel_flag: appliedFilters.vessel_flag || undefined,
  };

  const { data, isPending, isError, error, refetch, isFetching } =
    usePortVoyagesList(portId, queryFilters);

  const voyages = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, data?.pages ?? Math.ceil(total / pageSize));

  function updateUrl(
    nextPage,
    nextPageSize,
    nextSearch,
    nextDateRange,
    nextFilters,
  ) {
    const params = new URLSearchParams(searchParams);

    for (const key of [
      "page",
      "page_size",
      "vessel_name",
      "arrival_from",
      "arrival_to",
      "departure_time_from",
      "departure_time_to",
      "vessel_type",
      "vessel_flag",
    ]) {
      params.delete(key);
    }

    const trimmedSearch = nextSearch.trim();
    if (trimmedSearch) params.set("vessel_name", trimmedSearch);

    const arrivalFrom = dateToUrl(nextDateRange.from);
    const arrivalTo = dateToUrl(nextDateRange.to);
    if (arrivalFrom) params.set("arrival_from", arrivalFrom);
    if (arrivalTo) params.set("arrival_to", arrivalTo);

    if (nextFilters.departure_time_from) {
      params.set("departure_time_from", nextFilters.departure_time_from);
    }
    if (nextFilters.departure_time_to) {
      params.set("departure_time_to", nextFilters.departure_time_to);
    }

    (nextFilters.vessel_type ?? []).forEach((type) =>
      params.append("vessel_type", type),
    );

    if (nextFilters.vessel_flag) {
      params.set("vessel_flag", nextFilters.vessel_flag);
    }

    params.set("page", String(nextPage));
    params.set("page_size", String(nextPageSize));
    setSearchParams(params);
  }

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleSearch() {
    const nextDateRange = { ...dateRange };
    const nextFilters = { ...filters };

    setAppliedSearch(search);
    setAppliedDateRange(nextDateRange);
    setAppliedFilters(nextFilters);
    setPage(1);

    updateUrl(1, pageSize, search, nextDateRange, nextFilters);
  }

  function handleResetFilters() {
    const clearedFilters = {
      ...EMPTY_FILTERS,
      vessel_type: [],
    };

    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setDateRange({});
    setAppliedDateRange({});
    setSearch("");
    setAppliedSearch("");
    setPage(1);

    updateUrl(1, pageSize, "", {}, clearedFilters);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    updateUrl(
      nextPage,
      pageSize,
      appliedSearch,
      appliedDateRange,
      appliedFilters,
    );
  }

  function handlePageSizeChange(size) {
    setPageSize(size);
    setPage(1);
    updateUrl(
      1,
      size,
      appliedSearch,
      appliedDateRange,
      appliedFilters,
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Expected arrivals
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Vessels expected to arrive{port?.name ? ` at ${port.name}` : ""}.
        </p>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <label className="flex w-full flex-col gap-1.5 text-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
            <span className="font-medium text-slate-700">Vessel name</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                }}
                placeholder="Search vessel name"
                aria-label="Search expected arrivals"
                className="h-8 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </label>

          <label
            className={`flex min-w-full max-w-full flex-col gap-1.5 text-sm sm:min-w-[calc((100%-1rem)/2)] lg:min-w-[calc((100%-3rem)/4)] ${dateRange?.from ? "w-max" : "w-0"}`}
          >
            <span className="block font-medium text-slate-700">
              Arrival date and time
            </span>
            <DateRangeFilter
              className="min-w-full"
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </label>

          <label className="flex w-full flex-col gap-1.5 text-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
            <span className="font-medium text-slate-700">Vessel type</span>
            <VesselTypeDropdown
              selected={filters.vessel_type}
              onChange={(selected) => updateFilter("vessel_type", selected)}
            />
          </label>

          <label className="flex w-full flex-col gap-1.5 text-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
            <span className="font-medium text-slate-700">Vessel flag</span>
            <CountryDropdown
              selected={filters.vessel_flag}
              onChange={(country) => updateFilter("vessel_flag", country)}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reset filters
          </button>

          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 text-sm font-medium text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
          >
            <Search className="size-4" />
            Search
          </button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex justify-end border-b p-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 rounded-md border bg-white px-3 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {isError && (
          <p role="alert" className="p-4 text-sm text-destructive">
            {error?.message ?? "Could not load expected arrivals."}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Vessel</th>
                <th className="px-4 py-3 font-medium">IMO</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Flag</th>
                <th className="px-4 py-3 font-medium">Expected arrival</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Speed</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isPending ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-14 text-center text-slate-500"
                  >
                    Loading expected arrivals…
                  </td>
                </tr>
              ) : (
                voyages.map((voyage) => (
                  <tr key={voyage.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {voyage.ship?.id != null ? (
                          <Link
                            to={`/ships/${encodeURIComponent(voyage.ship.id)}`}
                            className="text-emerald-800 underline-offset-4 hover:underline"
                          >
                            {voyage.ship?.name ?? "Unknown vessel"}
                          </Link>
                        ) : (
                          voyage.ship?.name ?? "Unknown vessel"
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {voyage.ship?.imo ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {[voyage.ship?.vessel_type, voyage.ship?.vessel_subtype]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <VesselFlag country={voyage.ship?.flag} />
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {formatTimestamp(voyage.arrival_time)}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {voyage.departure_port_name ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {voyage.ship?.navigational_status ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {voyage.ship?.speed == null
                        ? "—"
                        : `${voyage.ship.speed} kn`}
                    </td>
                  </tr>
                ))
              )}

              {!isPending && !isError && voyages.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <Ship className="mx-auto size-8 text-slate-300" />
                    <p className="mt-3 font-medium text-slate-700">
                      No expected arrivals found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your filters, or check back later.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PortsPagination
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        total={total}
        isPending={isPending}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default ExpectedArrivalsTab;
