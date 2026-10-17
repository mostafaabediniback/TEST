import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { format } from "date-fns";
import DateRangeFilter from "@/components/DateRangeFilter";
import {
  Anchor,
  BarChart3,
  CalendarDays,
  Ship,
  ShipWheel,
} from "lucide-react";

const ships = [
  { name: "Ocean Pioneer", type: "Container", status: "In voyage", port: "Singapore", date: "2025-06-12" },
  { name: "Blue Horizon", type: "Tanker", status: "In port", port: "Rotterdam", date: "2025-06-13" },
  { name: "Northern Star", type: "Cargo", status: "In voyage", port: "Shanghai", date: "2025-06-14" },
  { name: "Sea Venture", type: "Container", status: "In port", port: "Singapore", date: "2025-06-15" },
  { name: "Atlantic Queen", type: "Tanker", status: "In voyage", port: "Rotterdam", date: "2025-06-16" },
];

const ports = ["Singapore", "Rotterdam", "Shanghai", "Los Angeles"];

const initialFilters = {
  from: undefined,
  to: undefined,
  status: "All statuses",
  port: "All ports",
  type: "All ship types",
};

function Home() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredShips = useMemo(
    () =>
      ships.filter((ship) => {
        return (
          (filters.status === "All statuses" || ship.status === filters.status) &&
          (filters.port === "All ports" || ship.port === filters.port) &&
          (filters.type === "All ship types" || ship.type === filters.type) &&
          (!filters.from || ship.date >= format(filters.from, "yyyy-MM-dd")) &&
          (!filters.to || ship.date <= format(filters.to, "yyyy-MM-dd"))
        );
      }),
    [filters]
  );

  const updateFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const inPort = filteredShips.filter((ship) => ship.status === "In port").length;
  const inVoyage = filteredShips.filter((ship) => ship.status === "In voyage").length;

  const lineOption = {
    color: ["#4776e6"],
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 16, top: 20, bottom: 25 },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: { lineStyle: { color: "#e7eaf0" } },
    },
    yAxis: { type: "value", splitLine: { lineStyle: { color: "#f0f2f6" } } },
    series: [{
      name: "Voyages",
      type: "line",
      smooth: true,
      symbolSize: 7,
      data: [18, 25, 21, 32, 28, 39, 35],
      areaStyle: { opacity: 0.08 },
    }],
  };

  const statusOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0, icon: "circle" },
    color: ["#4776e6", "#35b88a", "#f3ad4e"],
    series: [{
      type: "pie",
      radius: ["48%", "72%"],
      center: ["50%", "43%"],
      label: { show: false },
      data: [
        { value: inVoyage, name: "In voyage" },
        { value: inPort, name: "In port" },
        { value: Math.max(filteredShips.length - inVoyage - inPort, 0), name: "Other" },
      ],
    }],
  };

  const activityOption = {
    tooltip: { trigger: "axis" },
    legend: { top: 0, right: 0, icon: "circle" },
    grid: { left: 40, right: 16, top: 38, bottom: 25 },
    xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    yAxis: { type: "value", splitLine: { lineStyle: { color: "#f0f2f6" } } },
    series: [
      {
        name: "Arrivals",
        type: "bar",
        barMaxWidth: 12,
        data: [12, 18, 14, 22, 17, 25, 20],
        itemStyle: { color: "#4776e6", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Departures",
        type: "bar",
        barMaxWidth: 12,
        data: [9, 14, 19, 16, 23, 18, 26],
        itemStyle: { color: "#35b88a", borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const portOption = {
    tooltip: { trigger: "axis" },
    grid: { left: 95, right: 20, top: 10, bottom: 20 },
    xAxis: { type: "value", splitLine: { lineStyle: { color: "#f0f2f6" } } },
    yAxis: {
      type: "category",
      data: ports,
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: "bar",
      data: [42, 35, 28, 19],
      barMaxWidth: 18,
      itemStyle: { color: "#4776e6", borderRadius: [0, 5, 5, 0] },
    }],
  };

  const stats = [
    { label: "All ships", value: filteredShips.length, icon: Ship, color: "blue", note: "Ships matching filters" },
    { label: "Ships in port", value: inPort, icon: Anchor, color: "green", note: "Currently docked" },
    { label: "Ships in voyage", value: inVoyage, icon: ShipWheel, color: "purple", note: "Currently at sea" },
    { label: "Arrivals", value: 24, icon: CalendarDays, color: "orange", note: "Scheduled this week" },
    { label: "Departures", value: 18, icon: BarChart3, color: "pink", note: "Scheduled this week" },
  ];

  return (
    <main className="fleet-dashboard">
      <header className="fleet-heading">
        <div>
          <p className="fleet-eyebrow">FLEET MANAGEMENT</p>
          <h1>Fleet overview</h1>
          <p className="fleet-subtitle">Track your fleet and stay ahead of every voyage.</p>
        </div>
        <button className="fleet-export" onClick={() => window.print()}>
          Export report
        </button>
      </header>

      <section className="fleet-filter-card">
        <div className="fleet-filter-heading">
          <div>
            <strong>Filters</strong>
            <span>Refine your fleet data</span>
          </div>
          <button onClick={() => setFilters(initialFilters)}>Reset filters</button>
        </div>

        <div className="fleet-filter-grid">
          <div className={`fleet-date-range${filters.from ? " fleet-date-range--selected" : ""}`}>
            <DateRangeFilter
              label="Date range"
              className="min-h-9 min-w-full"
              dateRange={{ from: filters.from, to: filters.to }}
              onDateRangeChange={(range) => setFilters((current) => ({
                ...current,
                from: range?.from,
                to: range?.to,
              }))}
            />
          </div>
          <label>
            <span>Ship status</span>
            <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
              <option>All statuses</option>
              <option>In port</option>
              <option>In voyage</option>
            </select>
          </label>
          <label>
            <span>Port</span>
            <select value={filters.port} onChange={(event) => updateFilter("port", event.target.value)}>
              <option>All ports</option>
              {ports.map((port) => <option key={port}>{port}</option>)}
            </select>
          </label>
          <label>
            <span>Ship type</span>
            <select value={filters.type} onChange={(event) => updateFilter("type", event.target.value)}>
              <option>All ship types</option>
              <option>Container</option>
              <option>Tanker</option>
              <option>Cargo</option>
            </select>
          </label>
        </div>
      </section>

      <section className="fleet-stats-grid">
        {stats.map(({ label, value, icon: Icon, color, note }) => (
          <article className="fleet-stat-card" key={label}>
            <div className="fleet-stat-top">
              <span>{label}</span>
              <span className={`fleet-stat-icon ${color}`}><Icon size={17} /></span>
            </div>
            <strong className="fleet-stat-value">{value}</strong>
            <span className="fleet-stat-note">{note}</span>
          </article>
        ))}
      </section>

      <section className="fleet-charts-grid">
        <ChartCard title="Voyage activity" subtitle="Voyages tracked over the last 7 days">
          <ReactECharts option={lineOption} style={{ height: 230 }} />
        </ChartCard>
        <ChartCard title="Fleet status" subtitle="Current distribution of ships">
          <ReactECharts option={statusOption} style={{ height: 230 }} />
        </ChartCard>
        <ChartCard title="Port activity" subtitle="Arrivals and departures this week">
          <ReactECharts option={activityOption} style={{ height: 230 }} />
        </ChartCard>
        <ChartCard title="Voyages by port" subtitle="Most active ports this week">
          <ReactECharts option={portOption} style={{ height: 230 }} />
        </ChartCard>
      </section>

      <footer className="fleet-footer">
        Showing {filteredShips.length} ships <span>•</span> Last updated just now
      </footer>
    </main>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <article className="fleet-chart-card">
      <div className="fleet-chart-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </article>
  );
}

export default Home;