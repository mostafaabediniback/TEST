import { CarFront, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useCars } from "@/hooks/useCars";
import { useCarFilters } from "@/context/CarFilterContext";
import { useLocale } from "@/context/LocaleContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statuses = { all: "All vehicles", available: "Available", busy: "Busy", offline: "Offline" };

export default function Vehicles() {
  const { t, formatNumber } = useLocale();
  const { debouncedSearch, status, setStatus } = useCarFilters();
  const { data: cars = [], isFetching, isError } = useCars({ search: debouncedSearch, status });

  return (
    <section className="h-full overflow-y-auto bg-muted/30 p-4 sm:p-6" aria-labelledby="vehicles-title">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 id="vehicles-title" className="text-xl font-semibold">{t("Vehicle directory")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("Search and monitor your fleet.")}</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label={t("Status filter")}>
          {Object.entries(statuses).map(([value, label]) => (
            <Button key={value} variant={status === value ? "default" : "outline"} size="sm" onClick={() => setStatus(value)} aria-pressed={status === value}>{t(label)}</Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground" role="status">{isFetching ? t("Updating…") : t(cars.length === 1 ? "{count} car found" : "{count} cars found", { count: formatNumber(cars.length) })}</p>
        {isError ? (
          <Alert variant="destructive"><AlertDescription>{t("Could not load cars. Please try again.")}</AlertDescription></Alert>
        ) : cars.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cars.map((car) => (
              <Card key={car.id}>
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <CarFront className="size-5 text-muted-foreground" aria-hidden="true" />
                    <Badge variant={car.status === "available" ? "default" : "secondary"}>{t(statuses[car.status] ?? "Unknown status")}</Badge>
                  </div>
                  <CardTitle className="text-base"><bdi>{car.driverName}</bdi></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{t("Plate")}</dt><dd><bdi>{car.plate}</bdi></dd></div>
                    <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{t("ID")}</dt><dd><bdi>{typeof car.id === "number" ? formatNumber(car.id, { useGrouping: false }) : car.id}</bdi></dd></div>
                  </dl>
                  <Button nativeButton={false} variant="outline" className="w-full" render={<Link to={`/?car=${encodeURIComponent(car.id)}`} />}><MapPin className="size-4" />{t("View on map")}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isFetching && (
          <Card><CardContent className="space-y-2 py-10 text-center"><CarFront className="mx-auto mb-4 size-8 text-muted-foreground" /><p className="font-medium">{t("No vehicles found")}</p><p className="text-sm text-muted-foreground">{t("Try another search or status filter.")}</p></CardContent></Card>
        )}
      </div>
    </section>
  );
}
