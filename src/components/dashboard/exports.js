import { cellValue } from "./format.js";
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function toCsv(rows, columns, context) {
  return (
    "\ufeff" +
    [
      columns
        .map((column) => csvCell(context.t("dashboard." + column.label)))
        .join(","),
      ...rows.map((row) =>
        columns
          .map((column) => csvCell(cellValue(row, column.key, context)))
          .join(","),
      ),
    ].join("\r\n")
  );
}
function filterDescription(filters, t) {
  return Object.entries(filters)
    .filter(
      ([key, value]) =>
        !["page", "pageSize", "exportAll", "sortBy", "sortOrder"].includes(
          key,
        ) &&
        value !== "" &&
        value != null &&
        value !== false,
    )
    .map(
      ([key, value]) =>
        t("dashboard." + key) +
        ": " +
        (value === true
          ? "✓"
          : t("dashboard." + value, { defaultValue: String(value) })),
    )
    .join(" · ");
}
export async function exportReport(format, response, columns, context) {
  const rows = response.data.items;
  const filename = "fleet-report-" + response.meta.generatedAt.slice(0, 10);
  if (format === "csv") {
    downloadBlob(
      new Blob([toCsv(rows, columns, context)], {
        type: "text/csv;charset=utf-8",
      }),
      filename + ".csv",
    );
    return;
  }
  if (format === "xlsx") {
    const { default: ExcelJS } = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Mersad";
    const sheet = workbook.addWorksheet("Report", {
      views: [
        {
          rightToLeft: context.direction === "rtl",
          state: "frozen",
          ySplit: 1,
        },
      ],
    });
    sheet.columns = columns.map((column) => ({
      header: context.t("dashboard." + column.label),
      key: column.key,
      width: column.key.endsWith("At") ? 28 : 22,
    }));
    for (const row of rows)
      sheet.addRow(
        Object.fromEntries(
          columns.map((column) => [
            column.key,
            typeof row[column.key] === "number"
              ? row[column.key]
              : cellValue(row, column.key, context),
          ]),
        ),
      );
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1683BB" },
    };
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: Math.max(1, rows.length + 1), column: columns.length },
    };
    const metadata = workbook.addWorksheet("Filters");
    metadata.addRows([
      ["Reference clock", response.meta.generatedAt],
      ["Time zone", response.meta.timeZone],
      ["Result count", rows.length],
      ["Filters", JSON.stringify(response.meta.filters)],
    ]);
    downloadBlob(
      new Blob([await workbook.xlsx.writeBuffer()], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      filename + ".xlsx",
    );
    return;
  }
  if (format !== "pdf") throw new Error("Unsupported export format");
  const { jsPDF } = await import("jspdf");
  await document.fonts.ready;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageSize = 18;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  for (let page = 0; page < pages; page++) {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1060;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 1600, 1060);
    ctx.direction = context.direction;
    ctx.textAlign = context.direction === "rtl" ? "right" : "left";
    const edge = context.direction === "rtl" ? 1550 : 50;
    ctx.fillStyle = "#12324a";
    ctx.font = "bold 30px Sahel";
    ctx.fillText(context.t("dashboard.reportTable"), edge, 55);
    ctx.font = "18px Sahel";
    ctx.fillStyle = "#64748b";
    ctx.fillText(
      response.meta.generatedAt +
        " · " +
        response.meta.timeZone +
        " · " +
        context.formatNumber(rows.length) +
        " " +
        context.t("dashboard.results"),
      edge,
      90,
    );
    const description = filterDescription(response.meta.filters, context.t);
    const wrap = (text, maxWidth, maxLines = 2) => {
      const words = String(text).split(/\s+/);
      const lines = [""];
      for (const word of words) {
        const index = lines.length - 1;
        const candidate = (lines[index] + " " + word).trim();
        if (ctx.measureText(candidate).width > maxWidth && lines[index]) {
          if (lines.length === maxLines) {
            lines[index] += "…";
            break;
          }
          lines.push(word);
        } else lines[index] = candidate;
      }
      return lines;
    };
    wrap(description, 1490, 3).forEach((line, index) =>
      ctx.fillText(line, edge, 120 + index * 22),
    );
    const ordered =
      context.direction === "rtl" ? [...columns].reverse() : columns;
    const width = 1500 / ordered.length;
    ctx.font = "bold 17px Sahel";
    ctx.fillStyle = "#1683bb";
    ctx.fillRect(50, 190, 1500, 68);
    ctx.fillStyle = "#fff";
    ordered.forEach((column, i) => {
      const x =
        context.direction === "rtl"
          ? 50 + (i + 1) * width - 9
          : 50 + i * width + 9;
      wrap(context.t("dashboard." + column.label), width - 18, 3).forEach(
        (line, j) => ctx.fillText(line, x, 214 + j * 18),
      );
    });
    rows.slice(page * pageSize, (page + 1) * pageSize).forEach((row, index) => {
      const y = 258 + index * 40;
      ctx.fillStyle = index % 2 === 0 ? "#f1f6fa" : "#ffffff";
      ctx.fillRect(50, y, 1500, 40);
      ctx.fillStyle = "#1e293b";
      ctx.font = "16px Sahel";
      ordered.forEach((column, i) => {
        const x =
          context.direction === "rtl"
            ? 50 + (i + 1) * width - 9
            : 50 + i * width + 9;
        wrap(cellValue(row, column.key, context), width - 18).forEach(
          (line, j) => ctx.fillText(line, x, y + 17 + j * 17),
        );
      });
    });
    ctx.fillStyle = "#64748b";
    ctx.font = "18px Sahel";
    ctx.fillText(
      context.t("dashboard.page") +
        " " +
        context.formatNumber(page + 1) +
        " " +
        context.t("dashboard.of") +
        " " +
        context.formatNumber(pages),
      edge,
      1030,
    );
    if (page) pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 297, 196.76);
  }
  pdf.save(filename + ".pdf");
}
