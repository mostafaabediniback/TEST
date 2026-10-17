import { formatTimestamp } from "@/lib/dateTime";
import { useEffect, useMemo, useState } from "react";
import { Search, Ship } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePortInPort } from "@/hooks/usePortInPort";
import PortsPagination from "@/components/ports/PortsPagination";
import { VesselFlag } from "@/components/VesselFlag";

export function InPortTab({ port, portId }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");

  const { data, isPending, isError, error } = usePortInPort(
    portId,
    page,
    pageSize,
  );

  // API response: { total, page, page_size, pages, items }
  const vessels = Array.isArray(data)
    ? data
    : (data?.items ?? data?.data ?? []);

  const total = Array.isArray(data)
    ? (page - 1) * pageSize + vessels.length
    : (data?.total ?? data?.count ?? vessels.length);

  const pageCount = Math.max(1, data?.pages ?? Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const filteredVessels = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vessels;

    return vessels.filter((voyage) =>
      [
        voyage.ship?.name,
        voyage.ship?.imo,
        voyage.ship?.flag,
        voyage.ship?.vessel_type,
        voyage.ship?.vessel_subtype,
        voyage.ship?.navigational_status,
        voyage.departure_port_name,
        voyage.arrival_port_name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [vessels, search]);

  function handlePageSizeChange(size) {
    setPageSize(size);
    setPage(1);
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

      <Card className="p-4">
        <label className="flex flex-col gap-1.5 text-sm sm:max-w-xs">
          <span className="font-medium text-slate-700">Vessel, IMO, or type</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vessel, IMO, or type"
              aria-label="Search vessels in port"
              className="h-9 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </label>
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
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Flag</th>
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
                    colSpan={7}
                    className="px-4 py-14 text-center text-slate-500"
                  >
                    Loading vessels…
                  </td>
                </tr>
              ) : (
                filteredVessels.map((voyage) => (
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
                      {voyage.ship?.navigational_status ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatTimestamp(voyage.arrival_time)}
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

              {!isPending && !isError && filteredVessels.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
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
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
