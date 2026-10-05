import { CarFront, Map, Pin, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/context/LocaleContext";
import { SidebarProfile } from "./SidebarProfile";

const items = [
  { label: "Map", icon: Map, to: "/" },
  { label: "Vehicles", icon: CarFront, to: "/vehicles" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

export function Sidebar() {
  const { direction, isRtl, t } = useLocale();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile, isPinned, setOpen } = useSidebar();
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarRoot
      side={isRtl ? "right" : "left"}
      dir={direction}
      collapsible="icon"
      title={t("Navigation")}
      description={t("Fleet management")}
      closeLabel={t("Close sidebar")}
    >
      <SidebarHeader className="h-16 justify-center border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/" />}
              onClick={closeMobile}
              tooltip={t("Fleet management")}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <CarFront className="size-5" />
              </span>
              <span className="grid min-w-0 gap-0.5 text-start group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">
                  {t("Fleet management")}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {t("Fleet overview")}
                </span>
              </span>
            </SidebarMenuButton>
            {!isMobile && (
              <SidebarMenuAction
                type="button"
                aria-label={t("Pin sidebar")}
                title={t("Pin sidebar")}
                aria-pressed={isPinned}
                className="top-1/2 size-7 -translate-y-1/2 peer-data-[size=lg]/menu-button:top-1/2 aria-pressed:bg-sidebar-accent aria-pressed:text-sidebar-primary"
                onClick={() => setOpen((pinned) => !pinned)}
              >
                <Pin
                  className={isPinned ? "fill-current" : "-rotate-45"}
                  aria-hidden="true"
                />
              </SidebarMenuAction>
            )}
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
                    <SidebarMenuButton
                      render={<Link to={to} />}
                      isActive={pathname === to}
                      aria-current={pathname === to ? "page" : undefined}
                      tooltip={t(label)}
                      onClick={closeMobile}
                    >
                      <Icon />
                      <span>{t(label)}</span>
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
        <SidebarProfile />
      </SidebarFooter>
    </SidebarRoot>
  );
}
