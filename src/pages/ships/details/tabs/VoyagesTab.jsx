import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Ship } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PortsPagination from "@/components/ports/PortsPagination";
import DateRangeFilter from "@/components/DateRangeFilter";
import PortNameDropdown from "@/components/PortNameDropdown";
import { useLocale } from "@/context/LocaleContext";
import { formatTimestamp, toUnixSeconds } from "@/lib/dateTime";
import { useShipVoyages } from "@/hooks/useShipVoyages";

const FILTER_PARAMS = [
  "voyage_id",
  "departure_port_id",
  "arrival_port_id",
  "departure_time_from",
  "departure_time_to",
  "arrival_time_from",
  "arrival_time_to",
];

const createEmptyFilters = () => ({
  id: "",
  departure_port_id: "",
  arrival_port_id: "",
  departureRange: {},
  arrivalRange: {},
});

function optionalNumber(value) {
  if (value === "" || value == null) return undefined;

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function dateFromUnix(value) {
  const seconds = optionalNumber(value);
  return seconds == null ? undefined : new Date(seconds * 1000);
}

function getFiltersFromParams(params) {
  return {
    id: params.get("voyage_id") ?? "",
    departure_port_id: params.get("departure_port_id") ?? "",
    arrival_port_id: params.get("arrival_port_id") ?? "",
    departureRange: {
      from: dateFromUnix(params.get("departure_time_from")),
      to: dateFromUnix(params.get("departure_time_to")),
    },
    arrivalRange: {
      from: dateFromUnix(params.get("arrival_time_from")),
      to: dateFromUnix(params.get("arrival_time_to")),
    },
  };
}

function getAppliedFilters(params) {
  const values = {
    id: optionalNumber(params.get("voyage_id")),
    departure_port_id: optionalNumber(params.get("departure_port_id")),
    arrival_port_id: optionalNumber(params.get("arrival_port_id")),
    departure_time_from: optionalNumber(params.get("departure_time_from")),
    departure_time_to: optionalNumber(params.get("departure_time_to")),
    arrival_time_from: optionalNumber(params.get("arrival_time_from")),
    arrival_time_to: optionalNumber(params.get("arrival_time_to")),
  };

  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value != null),
  );
}

export default function VoyagesTab({ voyage }) {
  const { formatNumber } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();

  const shipId = voyage?.ship_id ?? voyage?.id;
  const page = positiveInteger(searchParams.get("page"), 1);
  const pageSize = positiveInteger(searchParams.get("page_size"), 20);
  const appliedFilters = getAppliedFilters(searchParams);

  const [filters, setFilters] = useState(() =>
    getFiltersFromParams(searchParams),
  );

  // Keep the form in sync with URL changes, including browser back/forward.
  useEffect(() => {
    setFilters(getFiltersFromParams(searchParams));
  }, [searchParams]);

  const { data, isPending, isError, error } = useShipVoyages({
    shipId,
    page,
    page_size: pageSize,
    sort_by: "id",
    sort_order: "desc",
    ...appliedFilters,
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, data?.pages ?? Math.ceil(total / pageSize));

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();

    const nextFilters = {
      voyage_id: optionalNumber(filters.id),
      departure_port_id: optionalNumber(filters.departure_port_id),
      arrival_port_id: optionalNumber(filters.arrival_port_id),
      departure_time_from: toUnixSeconds(filters.departureRange?.from),
      departure_time_to: toUnixSeconds(filters.departureRange?.to),
      arrival_time_from: toUnixSeconds(filters.arrivalRange?.from),
      arrival_time_to: toUnixSeconds(filters.arrivalRange?.to),
    };

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        FILTER_PARAMS.forEach((key) => next.delete(key));

        Object.entries(nextFilters).forEach(([key, value]) => {
          if (value != null) next.set(key, String(value));
        });

        next.set("page", "1");
        return next;
      },
      { replace: true },
    );
  }

  function resetFilters() {
    setFilters(createEmptyFilters());

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        FILTER_PARAMS.forEach((key) => next.delete(key));
        next.set("page", "1");

        return next;
      },
      { replace: true },
    );
  }

  function changePage(nextPage) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("page", String(nextPage));
        return next;
      },
      { replace: true },
    );
  }

  function changePageSize(size) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("page_size", String(size));
        next.set("page", "1");
        return next;
      },
      { replace: true },
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Voyages</h2>
        <p className="mt-1 text-sm text-slate-500">
          Departure and arrival details for this vessel.
        </p>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <form onSubmit={applyFilters}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">Voyage ID</span>
              <input
                type="number"
                value={filters.id}
                onChange={(event) => updateFilter("id", event.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">Departure port</span>
              <PortNameDropdown
                selectedId={filters.departure_port_id}
                onChange={(id) => updateFilter("departure_port_id", id)}
                placeholder="Select a departure port"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">Arrival port</span>
              <PortNameDropdown
                selectedId={filters.arrival_port_id}
                onChange={(id) => updateFilter("arrival_port_id", id)}
                placeholder="Select an arrival port"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">
                Departure date and time
              </span>
              <DateRangeFilter
                className="w-full"
                dateRange={filters.departureRange}
                onDateRangeChange={(range) =>
                  updateFilter("departureRange", range)
                }
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">
                Arrival date and time
              </span>
              <DateRangeFilter
                className="w-full"
                dateRange={filters.arrivalRange}
                onDateRangeChange={(range) =>
                  updateFilter("arrivalRange", range)
                }
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 p-4 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset filters
            </button>
            <button
              type="submit"
              className="h-9 rounded-md bg-emerald-900 px-4 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Search
            </button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white py-0">
        {isPending ? (
          <p className="p-6 text-sm text-muted-foreground">
            Loading voyages…
          </p>
        ) : isError ? (
          <p role="alert" className="p-6 text-sm text-destructive">
            {error?.message ?? "Could not load voyages."}
          </p>
        ) : rows.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs font-medium uppercase text-slate-500">
                    Voyage ID
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase text-slate-500">
                    Departure port
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase text-slate-500">
                    Departure time
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase text-slate-500">
                    Arrival port
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase text-slate-500">
                    Arrival time
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50">
                    <TableCell className="px-4 py-3 font-medium text-slate-900">
                      {row.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-600">
                      {row.departure_port_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-600">
                      {row.departure_time
                        ? formatTimestamp(row.departure_time)
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-600">
                      {row.arrival_port_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-600">
                      {row.arrival_time
                        ? formatTimestamp(row.arrival_time)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="px-4 py-14 text-center">
            <Ship className="mx-auto size-8 text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">No voyages found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your filters, or check back later.
            </p>
          </div>
        )}
      </Card>

      <PortsPagination
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        total={formatNumber(total)}
        isPending={isPending}
        onPageChange={changePage}
        onPageSizeChange={changePageSize}
      />
    </div>
  );
}
