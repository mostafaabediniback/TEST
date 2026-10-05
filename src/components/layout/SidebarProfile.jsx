import { useEffect } from "react";
import { ChevronsUpDown, Languages, Settings, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLocale } from "@/context/LocaleContext";
import { languages } from "./LanguageSwitcher";

function ProfileAvatar({ user }) {
  const initials = user?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <Avatar className="shrink-0">
      {user?.avatar && <AvatarImage src={user.avatar} alt="" />}
      <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
        {initials || <UserRound className="size-4" aria-hidden="true" />}
      </AvatarFallback>
    </Avatar>
  );
}

export function SidebarProfile({ user }) {
  const { locale, setLocale, direction, isRtl, t } = useLocale();
  const { isMobile, setOpenMobile, menuOpen, setMenuOpen } = useSidebar();
  const name = user?.name || t("Your profile");
  const subtitle = user?.email || t("Settings and language");

  // The menu lives in a portal. Keep its sidebar anchor expanded until it closes,
  // and release that temporary state if the mobile sidebar unmounts it.
  useEffect(() => () => setMenuOpen(false), [setMenuOpen]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                aria-label={t("Profile menu")}
                className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
              />
            }
          >
            <ProfileAvatar user={user} />
            <span className="grid min-w-0 flex-1 gap-0.5 text-start group-data-[collapsible=icon]:hidden">
              <bdi className="truncate text-sm font-medium">{name}</bdi>
              <bdi className="truncate text-xs text-muted-foreground">
                {subtitle}
              </bdi>
            </span>
            <ChevronsUpDown
              className="ms-auto size-4 group-data-[collapsible=icon]:hidden"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "top" : isRtl ? "left" : "right"}
            align="end"
            sideOffset={8}
            dir={direction}
            aria-label={t("Profile menu")}
            className="w-60 text-start"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 p-2 font-normal">
                <ProfileAvatar user={user} />
                <span className="grid min-w-0 gap-0.5">
                  <bdi className="truncate text-sm font-medium">{name}</bdi>
                  <bdi className="truncate text-xs text-muted-foreground">
                    {subtitle}
                  </bdi>
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<Link to="/settings" />}
              onClick={() => {
                if (isMobile) setOpenMobile(false);
              }}
            >
              <Settings aria-hidden="true" />
              {t("Settings")}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                aria-label={t("Language")}
                openOnHover={false}
              >
                <Languages aria-hidden="true" />
                <span>{t("Language")}</span>
                <span
                  className="ms-auto text-xs text-muted-foreground"
                  lang={locale}
                >
                  {
                    languages.find((language) => language.value === locale)
                      ?.label
                  }
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                side={isMobile ? "top" : "inline-end"}
                dir={direction}
                aria-label={t("Language")}
                className="w-44"
              >
                <DropdownMenuRadioGroup
                  value={locale}
                  onValueChange={setLocale}
                  aria-label={t("Language")}
                >
                  {languages.map((language) => (
                    <DropdownMenuRadioItem
                      key={language.value}
                      value={language.value}
                      closeOnClick
                    >
                      <span lang={language.value} dir={language.direction}>
                        {language.label}
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
