import { useState } from "react";
import { Search, Ship } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortVoyagesList } from "@/hooks/usePortVoyagesList";
import VesselTypeDropdown from "@/components/ships/VesselTypeDropdown";
import CountryDropdown from "@/components/ships/CountryDropdown";
import PortsPagination from "@/components/ports/PortsPagination";
import { VesselFlag } from "@/components/VesselFlag";
import DateRangeFilter from "@/components/DateRangeFilter";
import { formatTimestamp, toUnixSeconds } from "@/lib/dateTime";

const inputClassName =
  "h-8 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

function DateRange({ label, from, to, onFromChange, onToChange }) {
  return (
    <label className={`flex min-w-full max-w-full flex-col gap-1.5 text-sm sm:min-w-[calc((100%-1rem)/2)] lg:min-w-[calc((100%-2rem)/3)] ${from ? "w-max" : "w-0"}`}>
      <span className="font-medium text-slate-700">{label}</span>
      <DateRangeFilter
        className="min-w-full"
        dateRange={{ from, to }}
        onDateRangeChange={(range) => {
          onFromChange(range?.from);
          onToChange(range?.to);
        }}
      />
    </label>
  );
}

export function ArrivalsDeparturesTab({ port, portId }) {
  const [movementType, setMovementType] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [search, setSearch] = useState("");
  const [vesselType, setVesselType] = useState([]);
  const [vesselFlag, setVesselFlag] = useState("");
  const [arrivalDateFrom, setArrivalDateFrom] = useState();
  const [arrivalDateTo, setArrivalDateTo] = useState();
  const [departureDateFrom, setDepartureDateFrom] = useState();
  const [departureDateTo, setDepartureDateTo] = useState();

  const [appliedFilters, setAppliedFilters] = useState({});

  const filters = {
    page,
    page_size: pageSize,
    ...(movementType !== "all" && { port_type: movementType }),
    ...(movementType !== "departure" && { arrival_type: "arrivaled" }),

    vessel_name: appliedFilters.search || undefined,
    vessel_type: appliedFilters.vesselType || undefined,
    vessel_flag: appliedFilters.vesselFlag || undefined,

    ...(movementType !== "departure" && {
      arrival_time_from: toUnixSeconds(appliedFilters.arrivalDateFrom),
      arrival_time_to: toUnixSeconds(appliedFilters.arrivalDateTo),
    }),

    ...(movementType !== "arrival" && {
      departure_time_from: toUnixSeconds(appliedFilters.departureDateFrom),
      departure_time_to: toUnixSeconds(appliedFilters.departureDateTo),
    }),

    sort_by: "id",
    sort_order: "asc",
  };

  const { data, isPending, isError, error } = usePortVoyagesList(
    portId,
    filters,
  );

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  function handlePageSizeChange(nextPageSize) {
    setPageSize(Number(nextPageSize));
    setPage(1);
  }

  function handleSearch(event) {
    event.preventDefault();

    setAppliedFilters({
      search: search.trim(),
      vesselType: [...vesselType],
      vesselFlag: vesselFlag.trim(),
      arrivalDateFrom,
      arrivalDateTo,
      departureDateFrom,
      departureDateTo,
    });
    setPage(1);
  }

  function handleReset() {
    setSearch("");
    setVesselType([]);
    setVesselFlag("");
    setArrivalDateFrom(undefined);
    setArrivalDateTo(undefined);
    setDepartureDateFrom(undefined);
    setDepartureDateTo(undefined);
    setAppliedFilters({});
    setPage(1);
  }

  function handleMovementTypeChange(value) {
    setMovementType(value);
    setPage(1);
  }

  const movements = (data?.items ?? [])
    .flatMap((voyage) => {
      const common = {
        vessel: voyage.ship?.name ?? "Unknown vessel",
        imo: voyage.ship?.imo,
        terminal: "—",
        flag: voyage.ship?.flag,

        status: voyage.ship?.navigational_status ?? "—",
      };

      const rows = [];

      if (
        (movementType === "all" || movementType === "arrival") &&
        voyage.arrival_time != null
      ) {
        rows.push({
          ...common,
          id: `arrival-${voyage.id}`,
          type: "Arrival",
          timestamp: voyage.arrival_time,
          route: `${voyage.departure_port_name ?? "—"} → ${
            voyage.arrival_port_name ?? port?.name ?? "—"
          }`,
        });
      }

      if (
        (movementType === "all" || movementType === "departure") &&
        voyage.departure_time != null
      ) {
        rows.push({
          ...common,
          id: `departure-${voyage.id}`,
          type: "Departure",
          timestamp: voyage.departure_time,
          route: `${voyage.departure_port_name ?? port?.name ?? "—"} → ${
            voyage.arrival_port_name ?? "—"
          }`,
        });
      }

      return rows;
    })
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Arrivals and departures
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Vessel movements{port?.name ? ` at ${port.name}` : ""}.
        </p>
      </div>

      <Card className="overflow-hidden">
        <form onSubmit={handleSearch}>
          <div className="space-y-5 p-4 sm:p-5">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Movement type
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All movements" },
                  { value: "arrival", label: "Arrivals" },
                  { value: "departure", label: "Departures" },
                ].map(({ value, label }) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={movementType === value ? "default" : "outline"}
                    onClick={() => handleMovementTypeChange(value)}
                    aria-pressed={movementType === value}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block min-w-0">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Vessel name
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search vessel name"
                    aria-label="Filter by vessel name"
                    className={`${inputClassName} pl-9`}
                  />
                </div>
              </label>

              <label className="flex min-w-0 flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">
                  Vessel type
                </span>
                <VesselTypeDropdown
                  selected={vesselType}
                  onChange={(selected) => setVesselType(selected ?? [])}
                />
              </label>

              <label className="flex min-w-0 flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-700">
                  Vessel flag
                </span>
                <CountryDropdown
                  selected={vesselFlag}
                  onChange={(country) => setVesselFlag(country ?? "")}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-start gap-4">
              {movementType !== "departure" && (
                <DateRange
                  label="Arrival time"
                  from={arrivalDateFrom}
                  to={arrivalDateTo}
                  onFromChange={setArrivalDateFrom}
                  onToChange={setArrivalDateTo}
                />
              )}

              {movementType !== "arrival" && (
                <DateRange
                  label="Departure time"
                  from={departureDateFrom}
                  to={departureDateTo}
                  onFromChange={setDepartureDateFrom}
                  onToChange={setDepartureDateTo}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-10"
            >
              Reset filters
            </Button>

            <Button
              type="submit"
              className="h-10 bg-emerald-900 text-white hover:bg-emerald-800"
            >
              <Search className="mr-2 size-4" />
              Search
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {isError && (
          <p role="alert" className="p-4 text-sm text-destructive">
            {error?.message ?? "Could not load vessel movements."}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Vessel</th>
                <th className="px-4 py-3 font-medium">Movement</th>
                <th className="px-4 py-3 font-medium">Date and time</th>
                <th className="px-4 py-3 font-medium">From / to</th>
                <th className="px-4 py-3 font-medium">Terminal</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isPending ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-14 text-center text-slate-500"
                  >
                    Loading vessel movements…
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {movement.vessel}
                      </div>
                      <div className="text-xs text-slate-500">
                        IMO {movement.imo ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          movement.type === "Arrival" ? "default" : "outline"
                        }
                      >
                        {movement.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatTimestamp(movement.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {movement.route}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <VesselFlag country={movement.flag} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {movement.status}
                    </td>
                  </tr>
                ))
              )}

              {!isPending && !isError && movements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <Ship className="mx-auto size-8 text-slate-300" />
                    <p className="mt-3 font-medium text-slate-700">
                      No vessel movements found
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
}
