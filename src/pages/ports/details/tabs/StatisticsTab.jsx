import { toUnixSeconds } from "@/lib/dateTime";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  usePortArrivalDeparturePorts,
  usePortArrivalFlags,
  usePortArrivalSubtypes,
  usePortArrivalTypes,
  usePortDepartureArrivalPorts,
  usePortDepartureFlags,
  usePortDepartureSubtypes,
  usePortDepartureTypes,
} from "@/hooks/usePortStats";

import DateRangeFilter from "@/components/DateRangeFilter";
import PortsPagination from "@/components/ports/PortsPagination";
import { VesselFlag } from "@/components/VesselFlag";

const STAT_CONFIG = [
  {
    key: "arrival-departure-ports",
    title: "Arrival · Departure ports",
    field: "departure_port",
    hook: usePortArrivalDeparturePorts,
    portQueryParam: "departure_port_id",
    currentPortQueryParam: "arrival_port_id",
  },
  {
    key: "arrival-flags",
    title: "Arrival · Vessel flags",
    field: "flag",
    hook: usePortArrivalFlags,
  },
  {
    key: "arrival-types",
    title: "Arrival · Vessel types",
    field: "type",
    hook: usePortArrivalTypes,
  },
  {
    key: "arrival-subtypes",
    title: "Arrival · Vessel subtypes",
    field: "subtype",
    hook: usePortArrivalSubtypes,
  },
  {
    key: "departure-arrival-ports",
    title: "Departure · Arrival ports",
    field: "arrival_port",
    hook: usePortDepartureArrivalPorts,
    portQueryParam: "arrival_port_id",
    currentPortQueryParam: "departure_port_id",
  },
  {
    key: "departure-flags",
    title: "Departure · Vessel flags",
    field: "flag",
    hook: usePortDepartureFlags,
  },
  {
    key: "departure-types",
    title: "Departure · Vessel types",
    field: "type",
    hook: usePortDepartureTypes,
  },
  {
    key: "departure-subtypes",
    title: "Departure · Vessel subtypes",
    field: "subtype",
    hook: usePortDepartureSubtypes,
  },
];

function StatisticTable({ portId, config, dateOptions, pageSize }) {
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error } = config.hook(portId, {
    ...dateOptions,
    page,
    page_size: pageSize,
    sort_by: "value",
    sort_order: "desc",
  });

  const items = Array.isArray(data) ? data : (data?.items ?? []);
  const total = data?.total ?? items.length;
  const pageCount = Math.max(1, data?.pages ?? Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [dateOptions.start, dateOptions.end, pageSize]);

  return (
    <Card className="overflow-hidden">
      <div className="border-b px-4 py-3">
        <h4 className="font-semibold text-slate-900">{config.title}</h4>
      </div>

      {isError && (
        <p role="alert" className="p-4 text-sm text-destructive">
          {error?.message ?? "Could not load statistics."}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[250px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">
                {config.field.replaceAll("_", " ")}
              </th>
              <th className="px-4 py-3 text-right font-medium">Value</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isPending ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Loading…
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const portName = item[config.field] ?? "Unknown";
                const portItemId = config.portQueryParam
                  ? item[config.portQueryParam]
                  : (item.id ?? item.port_id);

                return (
                  <tr key={`${portItemId ?? portName}-${index}`}>
                    <td className="px-4 py-3 text-slate-700">
                      {config.portQueryParam && portItemId != null ? (
                        <Link
                          to={`/ports/${encodeURIComponent(portItemId)}`}
                          className="font-medium text-emerald-800 underline-offset-4 hover:underline"
                        >
                          {portName}
                        </Link>
                      ) : config.title.includes("Vessel flags") ? (
                        <VesselFlag country={item[config.field]} />
                      ) : (
                        portName
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {config.portQueryParam && portItemId != null ? (
                        <Link
                          to={`/voyage?${config.portQueryParam}=${encodeURIComponent(portItemId)}&${config.currentPortQueryParam}=${encodeURIComponent(portId)}`}
                          className="text-emerald-800 underline-offset-4 hover:underline"
                        >
                          {item.value ?? 0}
                        </Link>
                      ) : (
                        (item.value ?? 0)
                      )}
                    </td>
                  </tr>
                );
              })
            )}

            {!isPending && !isError && items.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No statistics found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t p-3">
        <PortsPagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          total={total}
          showPageSize={false}
          isPending={isPending}
          onPageChange={setPage}
        />
      </div>
    </Card>
  );
}

export default function StatisticsTab({ portId }) {
  const [dateRange, setDateRange] = useState();
  const [appliedDateRange, setAppliedDateRange] = useState();
  const [pageSize, setPageSize] = useState(5);

  const dateOptions = {
    start: toUnixSeconds(appliedDateRange?.from),
    end: toUnixSeconds(appliedDateRange?.to),
  };

  function handleSearch(event) {
    event.preventDefault();
    setAppliedDateRange(dateRange);
  }

  function handleReset() {
    setDateRange(undefined);
    setAppliedDateRange(undefined);
  }

  const sections = [
    {
      title: "Arrivals",
      description: "Vessels arriving at this port.",
      configs: STAT_CONFIG.slice(0, 4),
    },
    {
      title: "Departures",
      description: "Vessels departing from this port.",
      configs: STAT_CONFIG.slice(4),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Port statistics
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Arrival and departure breakdowns for this port.
        </p>
      </div>

      <form onSubmit={handleSearch}>
        <Card className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex max-w-full flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">
                Date and time range
              </span>
              <DateRangeFilter
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </label>

            <div className="flex flex-col gap-1.5 text-sm">
              <label
                htmlFor="statistics-page-size"
                className="font-medium text-slate-700"
              >
                Rows per page
              </label>

              <select
                id="statistics-page-size"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex gap-2">
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
          </div>
        </Card>
      </form>

      <div className="space-y-8">
        {sections.map((section) => (
          <section
            key={section.title}
            aria-labelledby={`${section.title.toLowerCase()}-heading`}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
              <h3
                id={`${section.title.toLowerCase()}-heading`}
                className="text-lg font-semibold text-slate-900"
              >
                {section.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {section.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
              {section.configs.map((config) => (
                <StatisticTable
                  key={config.key}
                  portId={portId}
                  config={config}
                  dateOptions={dateOptions}
                  pageSize={pageSize}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
