import { useState } from "react";
import { Search, Ship } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePortVoyagesList } from "@/hooks/usePortVoyagesList";
import PortsPagination from "@/components/ports/PortsPagination";
import VesselTypeDropdown from "@/components/ships/VesselTypeDropdown";
import CountryDropdown from "@/components/ships/CountryDropdown";
import { VesselFlag } from "@/components/VesselFlag";
import DateRangeFilter from "@/components/DateRangeFilter";

const EMPTY_FILTERS = {
  departure_time_from: "",
  departure_time_to: "",
  vessel_type: "",
  vessel_flag: "",
};

function formatTimestamp(timestamp) {
  if (timestamp == null) return "—";

  const date = new Date(Number(timestamp) * 1000);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function toUnixSeconds(value, endOfDay = false) {
  if (!value) return undefined;

  const date = new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}`);
  return Number.isNaN(date.getTime())
    ? undefined
    : Math.floor(date.getTime() / 1000);
}

const ExpectedArrivalsTab = ({ port, portId }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [dateRange, setDateRange] = useState({});
  const [appliedDateRange, setAppliedDateRange] = useState({});
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState({ ...EMPTY_FILTERS });

  const queryFilters = {
    page,
    page_size: pageSize,
    port_type: "arrival",
    arrival_type: "expected",
    sort_by: "id",
    sort_order: "asc",
    vessel_name: appliedSearch.trim() || undefined,
    arrival_time_from: appliedDateRange.from
      ? Math.floor(appliedDateRange.from.getTime() / 1000)
      : undefined,
    arrival_time_to: appliedDateRange.to
      ? Math.floor(appliedDateRange.to.getTime() / 1000)
      : undefined,
    departure_time_from: toUnixSeconds(appliedFilters.departure_time_from),
    departure_time_to: toUnixSeconds(appliedFilters.departure_time_to, true),
    vessel_type: appliedFilters.vessel_type || undefined,
    vessel_flag: appliedFilters.vessel_flag || undefined,
  };

  const { data, isPending, isError, error, refetch, isFetching } =
    usePortVoyagesList(portId, queryFilters);

  const voyages = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, data?.pages ?? Math.ceil(total / pageSize));

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleSearch() {
    setAppliedSearch(search);
    setAppliedDateRange({ ...dateRange });
    setAppliedFilters({ ...filters });
    setPage(1);
  }

  function handleResetFilters() {
    setFilters({ ...EMPTY_FILTERS });
    setAppliedFilters({ ...EMPTY_FILTERS });
    setDateRange({});
    setAppliedDateRange({});
    setSearch("");
    setAppliedSearch("");
    setPage(1);
  }

  function handlePageSizeChange(size) {
    setPageSize(size);
    setPage(1);
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
          <label className="w-full space-y-1.5 text-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
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

          <div className={`min-w-full max-w-full space-y-1.5 text-sm sm:min-w-[calc((100%-1rem)/2)] lg:min-w-[calc((100%-3rem)/4)] ${dateRange?.from ? "w-max" : "w-0"}`}>
            <span className="block font-medium text-slate-700">
              Arrival date and time
            </span>
            <DateRangeFilter
              className="min-w-full"
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>

          <label className="w-full space-y-1.5 text-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
            <span className="font-medium text-slate-700">Vessel type</span>
            <VesselTypeDropdown
              selected={filters.vessel_type}
              onChange={(selected) => updateFilter("vessel_type", selected)}
            />
          </label>

          <label className="w-full space-y-1.5 text-sm sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
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
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Vessel</th>
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
                    colSpan={7}
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
                        {voyage.ship?.name ?? "Unknown vessel"}
                      </div>
                      <div className="text-xs text-slate-500">
                        IMO {voyage.ship?.imo ?? "—"}
                      </div>
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
                  <td colSpan={7} className="px-4 py-14 text-center">
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
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default ExpectedArrivalsTab;
