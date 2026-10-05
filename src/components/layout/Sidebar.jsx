import { CarFront, Map, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar as SidebarRoot, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/context/LocaleContext";

const items = [
  { label: "Map", icon: Map, to: "/" },
  { label: "Vehicles", icon: CarFront, to: "/vehicles" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

export function Sidebar() {
  const { direction, isRtl, t } = useLocale();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeMobile = () => { if (isMobile) setOpenMobile(false); };

  return (
    <SidebarRoot side={isRtl ? "right" : "left"} dir={direction} collapsible="icon" title={t("Navigation")} description={t("Fleet management")} closeLabel={t("Close sidebar")}>
      <SidebarHeader className="h-16 justify-center border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />} onClick={closeMobile} tooltip={t("Fleet management")}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><CarFront className="size-5" /></span>
              <span className="grid min-w-0 gap-0.5 text-start group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">{t("Fleet management")}</span>
                <span className="truncate text-xs text-muted-foreground">{t("Fleet overview")}</span>
              </span>
            </SidebarMenuButton> 
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("Navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label={t("Navigation")}>
              <SidebarMenu>
                {items.map(({ label, icon: Icon, to }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton render={<Link to={to} />} isActive={pathname === to} aria-current={pathname === to ? "page" : undefined} tooltip={t(label)} onClick={closeMobile}>
                      <Icon /><span>{t(label)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <div className="flex h-10 items-center gap-2 px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:justify-center">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="group-data-[collapsible=icon]:hidden">{t("Live fleet")}</span>
        </div>
      </SidebarFooter>
    </SidebarRoot>
  );
}
