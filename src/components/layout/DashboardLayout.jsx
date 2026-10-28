import { usePageScroll } from "@/hooks/usePageReturn";
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

  const scrollRef = usePageScroll("layout", !isDashboard);

  return (
    <SearchProvider>
      <SidebarProvider
        defaultOpen={false}
        hoverToOpen
        dir={direction}
        className="h-dvh min-h-0 overflow-hidden"
      >
        <Sidebar />

        <SidebarInset
          data-map-popup-boundary
          className="relative isolate h-dvh min-w-0 overflow-hidden"
        >
          <header
            data-map-popup-obstacle={isDashboard ? "" : undefined}
            className="pointer-events-none absolute inset-x-0 top-0 z-[9999] flex h-16 items-center gap-2 border-b border-white/20 bg-transparent px-3 shadow-none backdrop-blur-0 sm:gap-3 sm:px-4 md:hidden"
          >
            <SidebarTrigger
              label={t("Toggle sidebar")}
              className="pointer-events-auto relative z-[10000] shrink-0"
            />

            {isDashboard && (
              <div className="pointer-events-auto relative z-[10000] mx-auto w-full max-w-xl">
                <AppSearch />
              </div>
            )}
          </header>

          {isDashboard && (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-[10000] hidden w-full px-4 md:block">
              <div
                data-map-popup-obstacle
                className="pointer-events-auto mx-auto w-full max-w-xl"
              >
                <AppSearch />
              </div>
            </div>
          )}
          <div className="relative h-full min-w-0 w-full">
            {isDashboard ? (
              <div className="absolute inset-0">
                <Outlet />
              </div>
            ) : (
              <div ref={scrollRef} className="app-page-content h-full min-w-0 w-full overflow-y-auto pt-16 md:pt-4">
                <Outlet />
              </div>
            )}
            {isDashboard && (
              <div className="pointer-events-none absolute inset-y-20 end-3 z-[900] flex flex-col items-end justify-between sm:end-4">
                <div className="pointer-events-auto">
                  <Toolbar />
                </div>

                <div className="pointer-events-auto">
                  <MapInfo />
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  );
}
