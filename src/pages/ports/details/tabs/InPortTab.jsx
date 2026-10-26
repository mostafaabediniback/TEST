import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Ship } from "lucide-react";

import DateRangeFilter from "@/components/DateRangeFilter";
import TimestampWithRelative from "@/components/TimestampWithRelative";
import TypeDropdown from "@/components/TypeDropdown";
import { Card } from "@/components/ui/card";
import { VesselFlag } from "@/components/VesselFlag";
import PortsPagination from "@/components/ports/PortsPagination";
import { usePortInPort } from "@/hooks/usePortInPort";
import VesselTypeDropdown from "@/components/ships/VesselTypeDropdown";

function parseDate(value) {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatElapsedTime(seconds) {
  if (seconds == null) return "—";

  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds)) return "—";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return [
    days && `${days}d`,
    hours && `${hours}h`,
    minutes && `${minutes}m`,
    `${remainingSeconds}s`,
  ]
    .filter(Boolean)
    .join(" ");
}

function getInitialFilters(params) {
  const arrivalFrom = parseDate(params.get("arrival_from"));
  const arrivalTo = parseDate(params.get("arrival_to"));

  return {
    vessel_name: params.get("vessel_name") || undefined,
    vessel_imo: params.get("vessel_imo") || undefined,
    vessel_subtype: params.getAll("vessel_subtype"),
    vessel_status: params.getAll("vessel_status"),
    arrival_time_from: arrivalFrom
      ? Math.floor(arrivalFrom.getTime() / 1000)
      : undefined,
    arrival_time_to: arrivalTo
      ? Math.floor(arrivalTo.getTime() / 1000)
      : undefined,
  };
}

export function InPortTab({ port }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const portId = port?.id;

  const [page, setPage] = useState(
    Math.max(1, Number(searchParams.get("page")) || 1),
  );
  const [pageSize, setPageSize] = useState(
    Math.max(1, Number(searchParams.get("pageSize")) || 20),
  );

  const [vesselName, setVesselName] = useState(
    searchParams.get("vessel_name") ?? "",
  );
  const [vesselImo, setVesselImo] = useState(
    searchParams.get("vessel_imo") ?? "",
  );
  const [vesselSubtype, setVesselSubtype] = useState(
    searchParams.getAll("vessel_subtype"),
  );
  const [vesselStatus, setVesselStatus] = useState(
    searchParams.getAll("vessel_status"),
  );
  const [arrivalRange, setArrivalRange] = useState(() => ({
    from: parseDate(searchParams.get("arrival_from")),
    to: parseDate(searchParams.get("arrival_to")),
  }));

  const [appliedFilters, setAppliedFilters] = useState(() =>
    getInitialFilters(searchParams),
  );

  const { data, isPending, isError, error } = usePortInPort(
    portId,
    page,
    pageSize,
    appliedFilters,
  );

  const vessels = Array.isArray(data)
    ? data
    : (data?.items ?? data?.data ?? []);

  const total = Array.isArray(data)
    ? (page - 1) * pageSize + vessels.length
    : (data?.total ?? data?.count ?? vessels.length);

  const pageCount = Math.max(1, data?.pages ?? Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  function updateUrl(nextPage, nextPageSize) {
    const params = new URLSearchParams(searchParams);

    params.delete("vessel_subtype");
    params.delete("vessel_status");

    const name = vesselName.trim();
    if (name) params.set("vessel_name", name);
    else params.delete("vessel_name");

    const imo = vesselImo.trim();
    if (imo) params.set("vessel_imo", imo);
    else params.delete("vessel_imo");

    vesselSubtype.forEach((subtype) =>
      params.append("vessel_subtype", subtype),
    );

    vesselStatus.forEach((status) => params.append("vessel_status", status));

    if (arrivalRange.from) {
      params.set("arrival_from", arrivalRange.from.toISOString());
    } else {
      params.delete("arrival_from");
    }

    if (arrivalRange.to) {
      params.set("arrival_to", arrivalRange.to.toISOString());
    } else {
      params.delete("arrival_to");
    }

    params.set("page", String(nextPage));
    params.set("pageSize", String(nextPageSize));

    setSearchParams(params);
  }

  function handleSearch() {
    const filters = {
      vessel_name: vesselName.trim() || undefined,
      vessel_imo: vesselImo.trim() || undefined,
      vessel_subtype: vesselSubtype.length ? vesselSubtype : undefined,
      vessel_status: vesselStatus.length ? vesselStatus : undefined,
      arrival_time_from: arrivalRange.from
        ? Math.floor(arrivalRange.from.getTime() / 1000)
        : undefined,
      arrival_time_to: arrivalRange.to
        ? Math.floor(arrivalRange.to.getTime() / 1000)
        : undefined,
    };

    setAppliedFilters(filters);
    setPage(1);

    const params = new URLSearchParams(searchParams);
    params.set("tab", "In port");

    for (const key of [
      "vessel_name",
      "vessel_imo",
      "vessel_subtype",
      "vessel_status",
      "arrival_from",
      "arrival_to",
    ]) {
      params.delete(key);
    }

    if (filters.vessel_name) {
      params.set("vessel_name", filters.vessel_name);
    }

    if (filters.vessel_imo) {
      params.set("vessel_imo", filters.vessel_imo);
    }

    filters.vessel_subtype?.forEach((value) =>
      params.append("vessel_subtype", value),
    );
    filters.vessel_status?.forEach((value) =>
      params.append("vessel_status", value),
    );

    if (arrivalRange.from) {
      params.set("arrival_from", arrivalRange.from.toISOString());
    }

    if (arrivalRange.to) {
      params.set("arrival_to", arrivalRange.to.toISOString());
    }

    params.set("page", "1");
    params.set("pageSize", String(pageSize));

    setSearchParams(params, { replace: true });
  }

  function handleResetFilters() {
    setVesselName("");
    setVesselImo("");
    setVesselSubtype([]);
    setVesselStatus([]);
    setArrivalRange({});
    setAppliedFilters({});
    setPage(1);

    const params = new URLSearchParams(searchParams);
    params.delete("vessel_name");
    params.delete("vessel_imo");
    params.delete("vessel_subtype");
    params.delete("vessel_status");
    params.delete("arrival_from");
    params.delete("arrival_to");
    params.set("page", "1");
    params.set("pageSize", String(pageSize));

    setSearchParams(params);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    updateUrl(nextPage, pageSize);
  }

  function handlePageSizeChange(nextPageSize) {
    setPageSize(nextPageSize);
    setPage(1);
    updateUrl(1, nextPageSize);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Vessels in port
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Vessels currently in port{port?.name ? ` at ${port.name}` : ""}.
        </p>
      </div>

      <Card className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Vessel name</span>
            <input
              value={vesselName}
              onChange={(event) => setVesselName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder="Search vessel name"
              aria-label="Search vessels in port"
              className="h-9 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Vessel IMO</span>
            <input
              value={vesselImo}
              onChange={(event) => setVesselImo(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder="Search IMO"
              aria-label="Search by vessel IMO"
              className="h-9 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </label>

          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">
              Vessel type/subtype
            </span>
            <VesselTypeDropdown
              selected={vesselSubtype}
              onChange={setVesselSubtype}
            />
          </div>

          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Vessel status</span>
            <TypeDropdown
              multiple
              selectedValue={vesselStatus}
              onChange={setVesselStatus}
              placeholder="Select statuses"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Arrival time</span>
            <DateRangeFilter
              mode="range"
              dateRange={arrivalRange}
              onDateRangeChange={setArrivalRange}
              label="Select arrival range"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end">
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
        {isError && (
          <p role="alert" className="p-4 text-sm text-destructive">
            {error?.message ?? "Could not load vessels in port."}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Vessel</th>
                <th className="px-4 py-3 font-medium">IMO</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Flag</th>
                <th className="px-4 py-3 font-medium">Time Anchor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Arrival</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Speed</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isPending ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-14 text-center text-slate-500"
                  >
                    Loading vessels…
                  </td>
                </tr>
              ) : (
                vessels.map((voyage) => (
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
                      {formatElapsedTime(voyage.status_elapsed_time)}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {voyage.ship?.navigational_status ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <TimestampWithRelative value={voyage.arrival_time} />
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {voyage.departure_port_name ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {voyage.ship?.speed == null
                        ? "—"
                        : `${voyage.ship.speed} kn`}
                    </td>
                  </tr>
                ))
              )}

              {!isPending && !isError && vessels.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <Ship className="mx-auto size-8 text-slate-300" />
                    <p className="mt-3 font-medium text-slate-700">
                      No vessels found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try another search, or check back later.
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
}
