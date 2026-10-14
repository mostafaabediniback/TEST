import { useMemo, useState } from "react";
import { CalendarDays, Search, Ship } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortVoyages } from "@/hooks/usePortVoyages";

function formatTimestamp(timestamp) {
  if (timestamp == null) return "—";

  const date = new Date(Number(timestamp) * 1000);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export function ArrivalsDeparturesPage({ port, portId }) {
  const [movementType, setMovementType] = useState("All");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  const {
    data,
    isPending,
    isError,
    error,
  } = usePortVoyages(portId);

  const movements = useMemo(() => {
    const arrivals = (data?.arrivals ?? []).map((voyage) => ({
      id: `arrival-${voyage.id}`,
      type: "Arrival",
      vessel: voyage.ship?.name,
      imo: voyage.ship?.imo,
      timestamp: voyage.arrival_time,
      route: voyage.departure_port_name
        ? `${voyage.departure_port_name} → ${voyage.arrival_port_name ?? port?.name ?? "—"}`
        : voyage.arrival_port_name ?? port?.name,
      terminal: "—",
      status: "—",
    }));

    const departures = (data?.departures ?? []).map((voyage) => ({
      id: `departure-${voyage.id}`,
      type: "Departure",
      vessel: voyage.ship?.name,
      imo: voyage.ship?.imo,
      timestamp: voyage.departure_time,
      route: `${voyage.departure_port_name ?? port?.name ?? "—"} → ${voyage.arrival_port_name ?? "—"}`,
      terminal: "—",
      status: "—",
    }));

    return [...arrivals, ...departures]
      .filter((movement) => {
        const matchesType =
          movementType === "All" || movement.type === movementType;

        const movementDate = movement.timestamp
          ? new Date(Number(movement.timestamp) * 1000)
              .toISOString()
              .slice(0, 10)
          : "";
        const matchesDate = !date || movementDate === date;

        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [movement.vessel, movement.imo, movement.type, movement.route]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));

        return matchesType && matchesDate && matchesSearch;
      })
      .sort((a, b) => Number(b.timestamp ?? 0) - Number(a.timestamp ?? 0));
  }, [data, movementType, search, date, port?.name]);

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

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter by movement">
            {["All", "Arrival", "Departure"].map((type) => (
              <Button
                key={type}
                type="button"
                size="sm"
                variant={movementType === type ? "default" : "outline"}
                onClick={() => setMovementType(type)}
                aria-pressed={movementType === type}
              >
                {type === "All" ? "All movements" : `${type}s`}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search vessel or IMO"
                className="h-9 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 sm:w-56"
              />
            </label>

            <label className="relative">
              <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                aria-label="Filter by date"
                className="h-9 rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </label>
          </div>
        </div>
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
                  <td colSpan={6} className="px-4 py-14 text-center text-slate-500">
                    Loading vessel movements…
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {movement.vessel ?? "Unknown vessel"}
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
                      {movement.route || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {movement.terminal}
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
    </div>
  );
}