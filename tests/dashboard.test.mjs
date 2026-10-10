import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import {
  buildDashboardResponse,
  deriveTrip,
  localDate,
} from "../src/services/dashboard/analytics.js";
import { createMockService } from "../src/services/dashboard/mockService.js";
import { getDashboardNow } from "../src/services/dashboard/clock.js";
import { getDetailsReturnTarget } from "../src/lib/shipNavigation.js";
import { toCsv, exportReport } from "../src/components/dashboard/exports.js";
const fixture = JSON.parse(
  await readFile(
    new URL("../src/mocks/dashboard/overview.json", import.meta.url),
    "utf8",
  ),
);
const now = Date.parse(fixture.meta.referenceAt);
const response = (tab = "overview", filters = {}) =>
  buildDashboardResponse(fixture, tab, filters, now);
const base = {
  id: "test",
  vehicleId: "V001",
  originParkingId: "P01",
  destinationParkingId: "P02",
  actualDepartureAt: "2026-10-10T10:00:00+03:30",
  estimatedArrivalAt: "2026-10-10T11:00:00+03:30",
  actualArrivalAt: null,
  timeZone: "Asia/Tehran",
};
const clock = Date.parse("2026-10-10T11:30:00+03:30");
test("In-progress overdue trips use elapsed duration and positive delay", () => {
  const trip = deriveTrip(base, clock);
  assert.equal(trip.status, "delayed_in_transit");
  assert.equal(trip.durationMinutes, null);
  assert.equal(trip.elapsedMinutes, 90);
  assert.equal(trip.delayMinutes, 30);
});
test("ETA equality is on time and ATD absence is scheduled", () => {
  assert.equal(
    deriveTrip(base, Date.parse(base.estimatedArrivalAt)).status,
    "in_transit",
  );
  assert.equal(
    deriveTrip({ ...base, actualDepartureAt: null }, clock).status,
    "scheduled",
  );
});
test("Completed on-time and late trips derive actual duration across offsets", () => {
  const onTime = deriveTrip(
    { ...base, actualArrivalAt: "2026-10-10T07:30:00Z" },
    clock,
  );
  assert.equal(onTime.status, "completed");
  assert.equal(onTime.durationMinutes, 60);
  const late = deriveTrip(
    { ...base, actualArrivalAt: "2026-10-10T08:00:00Z" },
    clock,
  );
  assert.equal(late.status, "completed_delayed");
  assert.equal(late.delayMinutes, 30);
});
test("Impossible arrival chronology fails rather than creating bad KPIs", () => {
  assert.throws(() =>
    deriveTrip({ ...base, actualArrivalAt: "2026-10-10T00:00:00Z" }, clock),
  );
  assert.throws(() =>
    deriveTrip(
      {
        ...base,
        actualDepartureAt: null,
        actualArrivalAt: "2026-10-10T08:00:00Z",
      },
      clock,
    ),
  );
});
test("Gregorian date boundaries are evaluated in the trip time zone", () => {
  assert.equal(localDate("2026-10-09T21:00:00Z"), "2026-10-10");
  assert.equal(localDate("2026-10-09T21:00:00Z", "UTC"), "2026-10-09");
});
test("Overview counts match the catalog, actual arrivals and current fleet", () => {
  const data = response().data;
  assert.equal(data.summary.totalVehicles, 18);
  assert.equal(data.summary.inTransitVehicles, 6);
  assert.equal(data.summary.parkedVehicles, 10);
  assert.equal(data.summary.completedTrips, 224);
  assert.equal(data.summary.totalTrips, 232);
  assert.equal(data.summary.totalEntries, 224);
  assert.equal(data.summary.totalExits, 230);
  assert.equal(
    data.charts.vehicleStatus.reduce((sum, row) => sum + row.value, 0),
    18,
  );
});
test("Only completed trips enter actual and estimated duration averages", () => {
  const data = response("vehicles", { exportAll: true }).data;
  const completed = data.items.filter((row) => row.actualArrivalAt);
  assert.equal(
    data.summary.averageDurationMinutes,
    completed.reduce((n, row) => n + row.durationMinutes, 0) / completed.length,
  );
  const incomplete = response("vehicles", { status: "in_transit" }).data;
  assert.equal(incomplete.summary.averageDurationMinutes, null);
  assert.ok(
    incomplete.charts.durationComparison.every(
      (row) =>
        row.averageDurationMinutes === null && row.estimatedMinutes === null,
    ),
  );
});
test("Combined vehicle, origin, destination, date, status and delay filters apply to KPIs, charts and rows", () => {
  const chosen = response("routes", { exportAll: true }).data.items.find(
    (row) => row.status === "completed_delayed",
  );
  const filters = {
    vehicleId: chosen.vehicleId,
    originParkingId: chosen.originParkingId,
    destinationParkingId: chosen.destinationParkingId,
    dateFrom: localDate(chosen.actualDepartureAt),
    dateTo: localDate(chosen.actualDepartureAt),
    status: "completed_delayed",
    delayedOnly: true,
    exportAll: true,
  };
  const data = response("routes", filters).data;
  assert.equal(data.items.length, 1);
  assert.equal(data.summary.totalTrips, 1);
  assert.equal(data.summary.delayedTrips, 1);
  assert.equal(data.charts.routeTraffic[0].trips, 1);
});
test("Current fleet status filters restrict both trips and fleet counts", () => {
  const data = response("overview", {
    vehicleStatus: "parked",
    exportAll: true,
  }).data;
  assert.equal(data.summary.parkedVehicles, 10);
  assert.equal(data.summary.inTransitVehicles, 0);
  assert.ok(
    data.items.every(
      (row) => !["in_transit", "delayed_in_transit"].includes(row.status),
    ),
  );
});
test("Opposite directions remain independent in routes and acyclic Sankey", () => {
  const data = response("routes").data;
  const pair = data.charts.routeTraffic.find((a) =>
    data.charts.routeTraffic.some(
      (b) =>
        a.originParkingId === b.destinationParkingId &&
        a.destinationParkingId === b.originParkingId,
    ),
  );
  assert.ok(pair);
  assert.ok(
    data.charts.sankey.links.every(
      (link) =>
        link.source.startsWith("origin:") &&
        link.target.startsWith("destination:"),
    ),
  );
  assert.equal(
    data.charts.sankey.links.reduce((n, row) => n + row.value, 0),
    data.summary.totalTrips,
  );
});
test("Parking traffic type and location filter actual event counts", () => {
  const data = response("parkings", {
    parkingId: "P01",
    trafficType: "outgoing",
  }).data;
  assert.equal(data.items.length, 1);
  assert.equal(data.items[0].id, "P01");
  assert.equal(data.summary.totalEntries, 0);
  assert.equal(data.summary.totalExits, data.items[0].exits);
  assert.equal(
    data.charts.heatmap.reduce((sum, row) => sum + row.value, 0),
    data.summary.totalExits,
  );
});
test("Arrival date filtering includes trips departing the previous local day", () => {
  const custom = {
    ...fixture,
    data: {
      ...fixture.data,
      trips: [
        {
          ...base,
          actualDepartureAt: "2026-10-09T23:30:00+03:30",
          estimatedArrivalAt: "2026-10-10T01:30:00+03:30",
          actualArrivalAt: "2026-10-10T01:00:00+03:30",
        },
      ],
    },
  };
  const data = buildDashboardResponse(
    custom,
    "parkings",
    {
      parkingId: "P02",
      dateFrom: "2026-10-10",
      dateTo: "2026-10-10",
      trafficType: "incoming",
    },
    now,
  ).data;
  assert.equal(data.summary.totalEntries, 1);
  assert.equal(data.summary.totalExits, 0);
});
test("Future time ranges return empty KPIs, charts and tables", () => {
  for (const tab of ["overview", "vehicles", "parkings", "routes", "reports"]) {
    const result = response(tab, {
      dateFrom: "2030-01-01",
      dateTo: "2030-01-02",
    });
    assert.equal(result.meta.pagination.totalItems, 0);
    assert.equal(result.data.summary.totalTrips, 0);
    assert.equal(result.data.summary.totalVehicles, 0);
  }
});
test("All report types select their own row schemas and summary scopes", () => {
  assert.equal(
    response("reports", { reportType: "completed" }).meta.pagination.totalItems,
    224,
  );
  assert.equal(
    response("reports", { reportType: "in_transit" }).meta.pagination
      .totalItems,
    6,
  );
  assert.equal(
    response("reports", { reportType: "parking_events" }).meta.pagination
      .totalItems,
    454,
  );
  assert.ok(
    response("reports", { reportType: "route_performance" }).data.items[0]
      .routeName,
  );
  assert.ok(
    response("reports", { reportType: "vehicle_performance" }).data.items[0]
      .trips,
  );
  assert.ok(
    response("reports", {
      reportType: "delays",
      exportAll: true,
    }).data.items.every((row) => row.delayed),
  );
});
test("Text search matches names and directed route labels", () => {
  const data = response("reports", { search: "Azarakhsh", exportAll: true }).data;
  assert.ok(data.items.length > 10);
  assert.ok(data.items.every((row) => row.vehicleId === "V001"));
  const route = response("routes").data.charts.routeTraffic[0];
  assert.ok(
    response("routes", { search: route.routeName }).meta.pagination.totalItems >
      0,
  );
});
test("Event report search matches visible parking rows only", () => {
  const data = response("reports", {
    reportType: "parking_events",
    search: "Shahid Rajaee Port",
    exportAll: true,
  }).data;
  assert.ok(data.items.length);
  assert.ok(data.items.every((row) => row.parkingName === "Shahid Rajaee Port"));
});
test("Sorting, page clamping and exports leave aggregate statistics unchanged", () => {
  const first = response("reports", { pageSize: 10 });
  const last = response("reports", { page: 999, pageSize: 10 });
  assert.equal(last.meta.pagination.page, 24);
  assert.equal(last.data.items.length, 2);
  assert.deepEqual(first.data.summary, last.data.summary);
  const all = response("reports", {
    sortBy: "delayMinutes",
    sortOrder: "desc",
    exportAll: true,
  });
  assert.equal(all.data.items.length, 232);
  assert.ok(
    all.data.items.every(
      (row, index) =>
        index === 0 ||
        row.delayMinutes <= all.data.items[index - 1].delayMinutes,
    ),
  );
});
test("Each independent fixture produces its own consistent response", async () => {
  for (const tab of ["overview", "vehicles", "parkings", "routes", "reports"]) {
    const source = JSON.parse(
      await readFile(
        new URL("../src/mocks/dashboard/" + tab + ".json", import.meta.url),
        "utf8",
      ),
    );
    const result = buildDashboardResponse(source, tab, {}, now);
    assert.equal(result.success, true);
    assert.equal(
      result.meta.pagination.totalItems,
      source.meta.pagination.totalItems,
    );
    assert.deepEqual(result.data.summary, source.data.summary);
    assert.deepEqual(source.data.vehicles, fixture.data.vehicles);
  }
});
test("Relative fixture clock keeps live scenarios testable years later", () => {
  const shifted = buildDashboardResponse(
    fixture,
    "routes",
    {},
    Date.parse("2032-02-14T09:30:00Z"),
  );
  assert.equal(shifted.data.summary.inTransitTrips, 6);
  assert.equal(
    shifted.data.summary.delayedTrips,
    response("routes").data.summary.delayedTrips,
  );
  assert.equal(getDashboardNow("2026-10-10T11:30:00+03:30"), clock);
  assert.throws(() => getDashboardNow("invalid"));
});
test("Invalid date order, service errors, empty states and abort are independent", async () => {
  const service = createMockService(fixture, "overview");
  assert.throws(() =>
    response("overview", { dateFrom: "2026-10-11", dateTo: "2026-10-10" }),
  );
  await assert.rejects(service({}, { mockState: "error", delay: 0 }));
  assert.equal(
    (await service({}, { mockState: "empty", delay: 0 })).meta.pagination
      .totalItems,
    0,
  );
  const controller = new AbortController();
  const request = service({}, { signal: controller.signal, delay: 100 });
  controller.abort();
  await assert.rejects(request, { name: "AbortError" });
});
test("Existing detail return navigation supports Home query state safely", () => {
  assert.equal(
    getDetailsReturnTarget(
      "?from=home&returnTo=" + encodeURIComponent("/?tab=vehicles"),
      {},
    ),
    "/?tab=vehicles",
  );
  assert.equal(
    getDetailsReturnTarget(
      "?from=home&returnTo=" + encodeURIComponent("//evil.test"),
      {},
    ),
    "/ships",
  );
});
const context = {
  t: (key) => key.split(".").at(-1),
  formatNumber: (value) => String(value),
  locale: "en",
  direction: "ltr",
};
test("CSV exports all filtered rows and neutralizes formula cells", () => {
  const result = response("reports", { vehicleId: "V001", exportAll: true });
  const columns = [
    { key: "vehicleTitle", label: "vehicleTitle" },
    { key: "delayMinutes", label: "delayMinutes" },
  ];
  const csv = toCsv(result.data.items, columns, context);
  assert.equal(csv.split("\r\n").length, result.data.items.length + 1);
  assert.ok(csv.startsWith("\ufeff"));
  assert.ok(
    toCsv(
      [{ vehicleTitle: '=HYPERLINK("danger")' }],
      columns,
      context,
    ).includes("'=HYPERLINK"),
  );
});
test("XLSX contains all filtered rows, selected columns, LTR and filter metadata", async () => {
  const result = response("reports", { vehicleId: "V001", exportAll: true });
  let captured;
  const originalCreate = URL.createObjectURL;
  const originalDocument = globalThis.document;
  URL.createObjectURL = (blob) => {
    captured = blob;
    return "blob:unit-test";
  };
  globalThis.document = { createElement: () => ({ click() {} }) };
  try {
    await exportReport(
      "xlsx",
      result,
      [
        { key: "vehicleTitle", label: "vehicleTitle" },
        { key: "delayMinutes", label: "delayMinutes" },
      ],
      context,
    );
    const { default: ExcelJS } = await import("exceljs");
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(Buffer.from(await captured.arrayBuffer()));
    const sheet = book.getWorksheet("Report");
    assert.equal(sheet.rowCount, result.data.items.length + 1);
    assert.equal(sheet.columnCount, 2);
    assert.equal(sheet.views[0].rightToLeft, false);
    assert.equal(sheet.getCell("A2").value, "Azarakhsh");
    assert.equal(typeof sheet.getCell("B2").value, "number");
    assert.ok(
      book.getWorksheet("Filters").getCell("B4").value.includes("V001"),
    );
  } finally {
    URL.createObjectURL = originalCreate;
    globalThis.document = originalDocument;
  }
});

// ECharts SSR exercises actual chart layout when an interactive browser is unavailable.
import * as echarts from "echarts";
import { buildChartOption } from "../src/components/dashboard/chartOptions.js";
import { CHART_KEYS } from "../src/components/dashboard/config.js";
test("Every requested chart, including Sankey and heatmap, renders with ECharts", () => {
  for (const tab of ["overview", "vehicles", "parkings", "routes", "reports"]) {
    const data = response(tab).data;
    for (const key of CHART_KEYS[tab]) {
      const chart = echarts.init(null, null, {
        renderer: "svg",
        ssr: true,
        width: 1000,
        height: 400,
      });
      try {
        chart.setOption(buildChartOption(key, data.charts, context));
        const svg = chart.renderToSVGString();
        assert.ok(svg.includes("<svg"));
        assert.ok(svg.includes("<path"), tab + ":" + key);
      } finally {
        chart.dispose();
      }
    }
  }
});
