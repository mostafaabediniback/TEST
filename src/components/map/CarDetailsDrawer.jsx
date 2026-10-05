import { CarFront, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer, DrawerClose, DrawerContent, DrawerDescription,
  DrawerFooter, DrawerHeader, DrawerTitle,
} from "@/components/ui/drawer";
import { useLocale } from "@/context/LocaleContext";

const statusLabels = { available: "Available", busy: "Busy", offline: "Offline" };
const statusStyles = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  busy: "border-orange-200 bg-orange-50 text-orange-700",
  offline: "border-slate-200 bg-slate-100 text-slate-600",
};

function Detail({ label, children }) {
  return (
    <div className="min-w-0 space-y-2 rounded-lg border bg-muted/30 p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="m-0 break-words text-sm font-medium">{children}</dd>
    </div>
  );
}

export function CarDetailsDrawer({ car, open, onOpenChange, id, finalFocus }) {
  const { direction, t, formatNumber } = useLocale();
  const coordinateOptions = { minimumFractionDigits: 5, maximumFractionDigits: 5, useGrouping: false };
  const displayId = typeof car?.id === "number" ? formatNumber(car.id, { useGrouping: false }) : car?.id;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="down" showSwipeHandle>
      <DrawerContent id={id} dir={direction} finalFocus={finalFocus} className="max-h-[85dvh] text-start md:mx-auto md:w-fit md:max-w-[calc(100vw-2rem)]">
        <DrawerHeader className="relative mx-auto w-full max-w-3xl ps-4 pe-16 text-start group-data-[swipe-axis=y]/drawer-popup:text-start sm:ps-6">
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted"><CarFront className="size-5" aria-hidden="true" /></div>
          <DrawerTitle>{t("Car details")}</DrawerTitle>
          <DrawerDescription>{t("Vehicle information and current location.")}</DrawerDescription>
          <DrawerClose render={<Button size="icon" variant="ghost" className="absolute end-4 top-4" aria-label={t("Close car details")} />}>
            <X className="size-4" aria-hidden="true" />
          </DrawerClose>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {car && (
            <dl className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 px-4 py-2 text-start sm:grid-cols-3 sm:px-6">
              <Detail label={t("Driver")}><bdi>{car.driverName}</bdi></Detail>
              <Detail label={t("Plate")}><bdi>{car.plate}</bdi></Detail>
              <Detail label={t("ID")}><bdi>{displayId}</bdi></Detail>
              <Detail label={t("Status")}>
                <Badge variant="outline" className={statusStyles[car.status] ?? statusStyles.offline}>{t(statusLabels[car.status] ?? "Unknown status")}</Badge>
              </Detail>
              <Detail label={t("Latitude")}><bdi dir="ltr" className="tabular-nums">{formatNumber(car.lat, coordinateOptions)}</bdi></Detail>
              <Detail label={t("Longitude")}><bdi dir="ltr" className="tabular-nums">{formatNumber(car.lng, coordinateOptions)}</bdi></Detail>
            </dl>
          )}
        </div>
        <DrawerFooter className="mx-auto w-full max-w-3xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          <DrawerClose render={<Button variant="outline" className="sm:ms-auto sm:min-w-28" />}>{t("Close")}</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
