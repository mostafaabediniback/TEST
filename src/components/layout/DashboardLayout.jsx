import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { SearchBox } from "./SearchBox";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MapToolbar } from "./MapToolbar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { CarFilterProvider } from "@/context/CarFilterContext";
import { useLocale } from "@/context/LocaleContext";

export function DashboardLayout() {
  const { direction, t } = useLocale();
  const { pathname } = useLocation();
  const isMap = pathname === "/";
  const isSettings = pathname === "/settings";
  const title = isMap ? "Live map" : isSettings ? "Settings" : "Vehicles";

  return (
    <CarFilterProvider>
      <SidebarProvider dir={direction} className="h-dvh min-h-0 overflow-hidden">
        <Sidebar />
        <SidebarInset className="h-dvh min-w-0 overflow-hidden">
          <header className="relative z-[900] flex h-16 shrink-0 items-center gap-2 border-b bg-background px-3 sm:gap-3 sm:px-4">
            <SidebarTrigger label={t("Toggle sidebar")} aria-label={t("Toggle sidebar")} title={t("Toggle sidebar")} />
            <Separator orientation="vertical" className="h-5" />
            <h1 className="hidden shrink-0 text-sm font-semibold lg:block">{t(title)}</h1>
            {!isSettings ? <SearchBox className="mx-auto min-w-0 flex-1 lg:max-w-xl" /> : <div className="flex-1" />}
            <LanguageSwitcher />
          </header>
          <div className="relative min-h-0 flex-1">
            <Outlet />
            {isMap && (
              <div className="absolute end-3 top-3 z-[800] sm:end-4 sm:top-4">
                <MapToolbar />
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CarFilterProvider>
  );
}
