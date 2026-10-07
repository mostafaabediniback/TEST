import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { SearchBox } from "./SearchBox";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SearchProvider } from "@/context/SearchContext";
import { useLocale } from "@/context/LocaleContext";
import { Toolbar } from "./Toolbar";
import { GlobalLoading } from "./GlobalLoading";

export function DashboardLayout() {
  const { direction, t } = useLocale();
  const { pathname } = useLocation();
  const isSettings = pathname === "/settings";

  return (
    <SearchProvider>
      <GlobalLoading />
      <SidebarProvider defaultOpen={false} hoverToOpen dir={direction} className="h-dvh min-h-0 overflow-hidden">
        <Sidebar />
        <SidebarInset className="h-dvh min-w-0 overflow-hidden">
          <header className="relative z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-3 sm:gap-3 sm:px-4">
            <SidebarTrigger label={t("Toggle sidebar")} className="shrink-0 md:hidden" />
            {!isSettings ? <SearchBox className="mx-auto min-w-0 flex-1 lg:max-w-xl" /> : <div className="flex-1" />}
          </header>
          <div className="relative min-h-0 flex-1">
            <Outlet />
                        {!isSettings && (
              <div className="absolute end-3 top-3 z-[800] sm:end-4 sm:top-4">
                <Toolbar />
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  );
}
