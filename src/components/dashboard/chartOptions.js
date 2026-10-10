const COLORS = [
  "#1683bb",
  "#22b59d",
  "#f4b44c",
  "#ed6a6a",
  "#8993c6",
  "#44b8d5",
];
export function buildChartOption(key, data, { t, formatNumber, locale }) {
  const label = (key) => t("dashboard." + key);
  const base = {
    color: COLORS,
    animationDuration: 350,
    textStyle: { fontFamily: "Sahel, sans-serif", fontSize: 11 },
    tooltip: {
      trigger: "axis",
      confine: true,
      valueFormatter: (value) =>
        value == null ? "—" : formatNumber(value, { maximumFractionDigits: 1 }),
    },
    legend: {
      top: 0,
      type: "scroll",
      textStyle: { fontFamily: "Sahel", color: "#64748b" },
    },
    grid: { top: 48, bottom: 55, left: 12, right: 16, containLabel: true },
  };
  const rows = data[key] ?? [];
  const axisStyle = {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: "#64748b", fontFamily: "Sahel", fontSize: 10 },
    splitLine: { lineStyle: { color: "#e2e8f0", type: "dashed" } },
  };
  const series = (name, values, type = "bar") => ({
    name: label(name),
    data: values,
    type,
    smooth: type === "line",
    showSymbol: false,
    barMaxWidth: 25,
    itemStyle: { borderRadius: type === "bar" ? [5, 5, 0, 0] : 0 },
    ...(type === "line"
      ? { areaStyle: { opacity: 0.07 }, lineStyle: { width: 3 } }
      : {}),
  });
  const cartesian = (categories, sets) => ({
    ...base,
    xAxis: {
      ...axisStyle,
      type: "category",
      data: categories,
      axisLabel: { ...axisStyle.axisLabel, width: 100, overflow: "truncate" },
    },
    yAxis: {
      ...axisStyle,
      type: "value",
      axisLabel: {
        ...axisStyle.axisLabel,
        formatter: (value) => formatNumber(value),
      },
    },
    series: sets,
    dataZoom: [
      { type: "inside", filterMode: "none" },
      {
        type: "slider",
        height: 14,
        bottom: 7,
        showDetail: false,
        borderColor: "transparent",
      },
    ],
  });
  const date = (value) =>
    new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : locale, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(value + "T12:00:00Z"));
  if (key === "vehicleStatus")
    return {
      ...base,
      tooltip: { ...base.tooltip, trigger: "item" },
      legend: { ...base.legend, bottom: 0, top: undefined },
      series: [
        {
          type: "pie",
          radius: ["52%", "76%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: true,
          itemStyle: { borderWidth: 5, borderColor: "#fff", borderRadius: 7 },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 15,
              fontFamily: "Sahel",
              formatter: "{b}\n{d}%",
            },
          },
          data: rows.map((row) => ({
            name: label(row.status),
            value: row.value,
          })),
        },
      ],
    };
  if (key === "sankey") {
    const nodes = new Map(rows.nodes.map((row) => [row.name, row.label]));
    const escape = (value) =>
      String(value).replace(
        /[&<>"']/g,
        (character) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[character],
      );
    return {
      ...base,
      tooltip: {
        trigger: "item",
        confine: true,
        formatter: (event) =>
          event.dataType === "edge"
            ? escape(nodes.get(event.data.source)) +
              " → " +
              escape(nodes.get(event.data.target)) +
              ": " +
              formatNumber(event.data.value)
            : escape(nodes.get(event.name)),
      },
      series: [
        {
          type: "sankey",
          left: 105,
          right: 105,
          top: 24,
          bottom: 24,
          nodeWidth: 14,
          nodeGap: 18,
          draggable: false,
          emphasis: { focus: "adjacency" },
          label: {
            formatter: (event) => nodes.get(event.name),
            fontFamily: "Sahel",
            fontSize: 11,
            width: 95,
            overflow: "truncate",
          },
          lineStyle: { color: "gradient", opacity: 0.3, curveness: 0.5 },
          data: rows.nodes.map((row) => ({
            name: row.name,
            depth: row.side === "origin" ? 0 : 1,
          })),
          links: rows.links,
        },
      ],
    };
  }
  if (key === "heatmap")
    return {
      ...base,
      grid: { ...base.grid, top: 12, bottom: 55 },
      tooltip: {
        position: "top",
        confine: true,
        formatter: (event) =>
          label("weekdays").split(",")[event.data[1]] +
          " · " +
          formatNumber(event.data[0]) +
          ":00 · " +
          formatNumber(event.data[2]),
      },
      xAxis: {
        ...axisStyle,
        type: "category",
        data: Array.from({ length: 24 }, (_, i) => formatNumber(i)),
      },
      yAxis: {
        ...axisStyle,
        type: "category",
        data: label("weekdays").split(","),
      },
      visualMap: {
        min: 0,
        max: Math.max(1, ...rows.map((row) => row.value)),
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        itemWidth: 10,
        itemHeight: 100,
        inRange: { color: ["#eef7fb", "#90cfe5", "#1683bb"] },
      },
      series: [
        {
          type: "heatmap",
          data: rows.map((row) => [row.hour, row.day, row.value]),
          emphasis: { itemStyle: { borderColor: "#1683bb", borderWidth: 2 } },
        },
      ],
    };
  if (["tripsByDay", "vehicleTrend", "delayTrend"].includes(key))
    return cartesian(
      rows.map((row) => date(row.date)),
      [
        series(
          key === "delayTrend" ? "delays" : "trips",
          rows.map((row) => (key === "delayTrend" ? row.delays : row.trips)),
          "line",
        ),
      ],
    );
  if (key === "parkingTrend")
    return cartesian(
      rows.map((row) => date(row.date)),
      [
        series(
          "entries",
          rows.map((row) => row.entries),
          "line",
        ),
        series(
          "exits",
          rows.map((row) => row.exits),
          "line",
        ),
      ],
    );
  if (key === "parkingTraffic")
    return cartesian(
      rows.map((row) => row.parkingName),
      [
        series(
          "entries",
          rows.map((row) => row.entries),
        ),
        series(
          "exits",
          rows.map((row) => row.exits),
        ),
      ],
    );
  if (key === "parkedByParking")
    return cartesian(
      rows.map((row) => row.parkingName),
      [
        series(
          "stationed",
          rows.map((row) => row.stationed),
        ),
      ],
    );
  if (key === "parkingRanking")
    return cartesian(
      rows.map((row) => row.parkingName),
      [
        series(
          "trips",
          rows.map((row) => row.entries + row.exits),
        ),
      ],
    );
  if (key === "durationComparison")
    return cartesian(
      rows.map((row) => row.routeName ?? row.vehicleTitle),
      [
        series(
          "actual",
          rows.map((row) => row.averageDurationMinutes),
        ),
        series(
          "estimated",
          rows.map((row) => row.estimatedMinutes),
        ),
      ],
    );
  if (key === "routeDuration")
    return cartesian(
      rows.map((row) => row.routeName),
      [
        series(
          "averageDurationMinutes",
          rows.map((row) => row.averageDurationMinutes),
        ),
      ],
    );
  return cartesian(
    rows.map((row) => row.routeName ?? row.vehicleTitle),
    [
      series(
        "trips",
        rows.map((row) => row.trips),
      ),
    ],
  );
}
