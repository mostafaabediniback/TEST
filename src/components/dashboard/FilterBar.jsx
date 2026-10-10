import { Filter, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { REPORT_TYPES } from "./config";
export default function FilterBar({
  tab,
  filters,
  options,
  onChange,
  onReset,
}) {
  const { t } = useLocale();
  const fields =
    tab === "overview"
      ? ["vehicleStatus", "parkingId", "vehicleId"]
      : tab === "parkings"
        ? ["parkingId", "trafficType", "vehicleId"]
        : [
            "vehicleId",
            "status",
            "originParkingId",
            "destinationParkingId",
            ...(tab === "reports" && filters.reportType === "parking_events"
              ? ["parkingId", "trafficType"]
              : []),
          ];
  const values = (key) =>
    key === "vehicleId"
      ? (options?.vehicles?.map((row) => ({
          value: row.id,
          label: row.title + " · " + row.registration,
        })) ?? [])
      : ["parkingId", "originParkingId", "destinationParkingId"].includes(key)
        ? (options?.parkings?.map((row) => ({
            value: row.id,
            label: row.name,
          })) ?? [])
        : (key === "vehicleStatus"
            ? ["parked", "in_transit", "inactive"]
            : key === "trafficType"
              ? ["incoming", "outgoing"]
              : (options?.statuses ?? [])
          ).map((value) => ({ value, label: t("dashboard." + value) }));
  return (
    <Card className="gap-4 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Filter className="size-4 text-primary" />
          {t("dashboard.filters")}
        </h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="size-3.5" />
          {t("dashboard.reset")}
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {tab === "reports" && (
          <label className="dashboard-field">
            <span>{t("dashboard.reportType")}</span>
            <select
              value={filters.reportType ?? "movements"}
              onChange={(event) =>
                onChange({
                  reportType: event.target.value,
                  sortBy: "",
                  visibleColumns: "",
                })
              }
            >
              {REPORT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t("dashboard." + value)}
                </option>
              ))}
            </select>
          </label>
        )}
        {["dateFrom", "dateTo"].map((key) => (
          <label className="dashboard-field" key={key}>
            <span>{t("dashboard." + key)}</span>
            <input
              type="date"
              value={filters[key] ?? ""}
              onChange={(event) => onChange({ [key]: event.target.value })}
            />
          </label>
        ))}
        {fields.map((key) => (
          <label className="dashboard-field" key={key}>
            <span>{t("dashboard." + key)}</span>
            <select
              value={filters[key] ?? ""}
              onChange={(event) => onChange({ [key]: event.target.value })}
            >
              <option value="">{t("dashboard.all")}</option>
              {values(key).map((row) => (
                <option key={row.value} value={row.value}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {["vehicles", "routes", "reports"].includes(tab) && (
        <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={!!filters.delayedOnly}
            onChange={(event) =>
              onChange({ delayedOnly: event.target.checked })
            }
          />
          {t("dashboard.delayedOnly")}
        </label>
      )}
    </Card>
  );
}
