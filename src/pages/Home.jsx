import { lazy, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  Ship,
  Anchor,
  Route,
  FileBarChart,
  RefreshCw,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/context/LocaleContext";
import { TAB_KEYS } from "@/components/dashboard/config";
import "@/components/dashboard/dashboard.css";
const tabs = {
  overview: lazy(() => import("@/components/dashboard/tabs/OverviewTab")),
  vehicles: lazy(() => import("@/components/dashboard/tabs/VehiclesTab")),
  parkings: lazy(() => import("@/components/dashboard/tabs/ParkingsTab")),
  routes: lazy(() => import("@/components/dashboard/tabs/RoutesTab")),
  reports: lazy(() => import("@/components/dashboard/tabs/ReportsTab")),
};
const icons = {
  overview: LayoutDashboard,
  vehicles: Ship,
  parkings: Anchor,
  routes: Route,
  reports: FileBarChart,
};
export default function Home() {
  const { t, direction } = useLocale();
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const active = TAB_KEYS.includes(params.get("tab"))
    ? params.get("tab")
    : "overview";
  const ActiveTab = tabs[active];
  function selectTab(tab) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set("tab", tab);
      return next;
    });
  }
  function keyboardTab(event) {
    const index = TAB_KEYS.indexOf(active);
    let target;
    if (event.key === "Home") target = 0;
    else if (event.key === "End") target = TAB_KEYS.length - 1;
    else if (event.key === "ArrowRight")
      target =
        (index + (direction === "rtl" ? -1 : 1) + TAB_KEYS.length) %
        TAB_KEYS.length;
    else if (event.key === "ArrowLeft")
      target =
        (index + (direction === "rtl" ? 1 : -1) + TAB_KEYS.length) %
        TAB_KEYS.length;
    if (target != null) {
      event.preventDefault();
      selectTab(TAB_KEYS[target]);
      document.getElementById("tab-" + TAB_KEYS[target])?.focus();
    }
  }
  return (
    <main
      dir={direction}
      className="dashboard-home h-full overflow-y-auto bg-muted/30 px-4 pb-8 pt-20 sm:px-6"
    >
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <LayoutDashboard className="size-6" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {t("dashboard.title")}
              </h1>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                {t("dashboard.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary">
              {t("dashboard.mock")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["dashboard", active],
                })
              }
            >
              <RefreshCw className="size-3.5" />
              {t("dashboard.refresh")}
            </Button>
          </div>
        </header>
        <div
          className="overflow-x-auto border-b"
          role="tablist"
          aria-label={t("dashboard.title")}
          onKeyDown={keyboardTab}
        >
          <div className="flex min-w-max gap-1">
            {TAB_KEYS.map((key) => {
              const Icon = icons[key];
              return (
                <button
                  type="button"
                  id={"tab-" + key}
                  key={key}
                  role="tab"
                  aria-selected={active === key}
                  aria-controls={"panel-" + key}
                  tabIndex={active === key ? 0 : -1}
                  onClick={() => selectTab(key)}
                  className={
                    "flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-medium transition-colors " +
                    (active === key
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground")
                  }
                >
                  <Icon className="size-4" />
                  {t("dashboard." + key)}
                </button>
              );
            })}
          </div>
        </div>
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-40" />
              <Skeleton className="h-80" />
            </div>
          }
        >
          <ActiveTab />
        </Suspense>
        <details className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
          <summary className="flex cursor-pointer items-center gap-2">
            <Clock3 className="size-3.5" />
            {t("dashboard.clock")} · Asia/Tehran
          </summary>
          <label className="dashboard-field mt-3 max-w-sm">
            <span>{t("dashboard.clock")}</span>
            <input
              type="datetime-local"
              value={(params.get("referenceAt") ?? "").slice(0, 16)}
              onChange={(event) =>
                setParams(
                  (current) => {
                    const next = new URLSearchParams(current);
                    if (event.target.value)
                      next.set("referenceAt", event.target.value + "+03:30");
                    else next.delete("referenceAt");
                    return next;
                  },
                  { replace: true },
                )
              }
            />
          </label>
        </details>
      </div>
    </main>
  );
}
