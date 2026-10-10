import {
  Anchor,
  Ship,
  Route,
  Clock3,
  CheckCheck,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/context/LocaleContext";
const icons = {
  totalVehicles: Ship,
  activeVehicles: Ship,
  parkedVehicles: Anchor,
  inTransitVehicles: Route,
  completedTrips: CheckCheck,
  delayedTrips: AlertTriangle,
  activeParkings: Anchor,
  averageDurationMinutes: Clock3,
  averageStopMinutes: Clock3,
  totalEntries: ArrowDownLeft,
  totalExits: ArrowUpRight,
  totalTrips: Activity,
  activeRoutes: Route,
  stationedVehicles: Anchor,
  inTransitTrips: Route,
};
export default function KpiCard({ metric, value }) {
  const { t, formatNumber } = useLocale();
  const Icon = icons[metric] ?? Activity;
  const duration = metric.endsWith("Minutes");
  return (
    <Card className="relative gap-3 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {t("dashboard." + metric)}
        </span>
        <span
          className={
            "flex size-8 shrink-0 items-center justify-center rounded-lg " +
            (metric === "delayedTrips"
              ? "bg-amber-500/10 text-amber-600"
              : "bg-primary/8 text-primary")
          }
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <strong className="text-2xl font-semibold tracking-tight">
          {value == null
            ? "—"
            : formatNumber(value, { maximumFractionDigits: duration ? 1 : 0 })}
        </strong>
        {duration && value != null && (
          <span className="text-xs text-muted-foreground">
            {t("dashboard.minute")}
          </span>
        )}
      </div>
      {value == null && (
        <span className="text-[11px] text-muted-foreground">
          {t("dashboard.insufficient")}
        </span>
      )}
    </Card>
  );
}
