import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useLocale } from "@/context/LocaleContext";
import { SearchProvider } from "@/context/SearchContext";
import { Outlet, useLocation } from "react-router-dom";

import AppSearch from "./AppSearch";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import MapInfo from "@/components/map/MapInfo";

export function DashboardLayout() {
  const { direction, t } = useLocale();
  const { pathname } = useLocation();

  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  return (
    <SearchProvider>
      <SidebarProvider
        defaultOpen={false}
        hoverToOpen
        dir={direction}
        className="h-dvh min-h-0 overflow-hidden"
      >
        <Sidebar />

        <SidebarInset className="relative h-dvh min-w-0 overflow-hidden">
          {/* Header overlay */}
          <header className="pointer-events-none absolute inset-x-0 top-0 z-[9999] flex h-16 items-center gap-2 border-b border-white/20 bg-transparent px-3 shadow-none backdrop-blur-0 sm:gap-3 sm:px-4">
            <SidebarTrigger
              label={t("Toggle sidebar")}
              className="pointer-events-auto relative z-[10000] shrink-0 md:hidden"
            />

            {isDashboard ? (
              <div className="pointer-events-auto relative z-[10000] mx-auto w-full max-w-xl">
                <AppSearch />
              </div>
            ) : (
              <div className="flex-1" />
            )}
          </header>

          {/* Full-screen map and page content */}
          <div className="relative h-full w-full">
            <div className="absolute inset-0 z-0">
              <Outlet />
            </div>

            {/* Toolbar above the map */}
{isDashboard && (
  <div className="pointer-events-auto absolute end-3 top-20 z-[900] flex w-fit flex-col items-end gap-2 sm:end-4">
    <Toolbar />
    <MapInfo />
  </div>
)}


            
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  );
}
