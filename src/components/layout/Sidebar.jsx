import { LayoutDashboard, PanelsTopLeft, Pin } from "lucide-react";
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
import { Ship } from "lucide-react";
import { Anchor } from "lucide-react";
import { Navigation } from "lucide-react";
import NavigationIcone from "../../../public/projectIcon.jpg";

const items = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/",
  },
  {
    label: "Map",
    icon: PanelsTopLeft,
    to: "/dashboard/0/0/0",
  },
  {
    label: "Ships",
    icon: Ship,
    to: "/ships",
  },
  {
    label: "Voyage",
    icon: Navigation,
    to: "/voyage",
  },
  {
    label: "Port",
    icon: Anchor,
    to: "/port",
  },
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
      description={t("Application")}
      closeLabel={t("Close sidebar")}
    >
      <SidebarHeader className="tooba-sidebar-header h-16 shrink-0 justify-center border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="tooba-brand"
              render={<Link to="/" />}
              onClick={closeMobile}
              tooltip="Tooba"
            >
              <span className="tooba-brand-logo">
                <img
                  src="/projectIcon.jpg"
                  alt="Tooba logo"
                  className="size-full object-contain"
                />
              </span>
              <span className="tooba-brand-copy min-w-0 group-data-[collapsible=icon]:hidden">
                <span dir="ltr" className="tooba-brand-name">Tooba</span>
              </span>
            </SidebarMenuButton>
            {!isMobile && (
              <SidebarMenuAction
                type="button"
                aria-label={t("Pin sidebar")}
                title={t("Pin sidebar")}
                aria-pressed={isPinned}
                className="tooba-brand-pin top-1/2 size-7 -translate-y-1/2 peer-data-[size=lg]/menu-button:top-1/2"
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
