import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import DateRangeFilter from "@/components/DateRangeFilter";
import FilterInput from "./FilterInput";

export default function VoyagesFilters({
  filters,
  departureRange,
  arrivalRange,
  updateFilter,
  setDepartureRange,
  setArrivalRange,
  handleSearch,
  handleReset,
}) {
  const { t } = useLocale();

  return (
    <Card className="p-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterInput
            label="Voyage ID"
            value={filters.id}
            onChange={(value) => updateFilter("id", value)}
          />
          <FilterInput
            label={t("shipId", { defaultValue: "Ship ID" })}
            value={filters.ship_id}
            onChange={(value) => updateFilter("ship_id", value)}
          />
          <FilterInput
            label={t("departurePortId", { defaultValue: "Departure port ID" })}
            value={filters.departure_port_id}
            onChange={(value) => updateFilter("departure_port_id", value)}
          />
          <FilterInput
            label={t("arrivalPortId", { defaultValue: "Arrival port ID" })}
            value={filters.arrival_port_id}
            onChange={(value) => updateFilter("arrival_port_id", value)}
          />
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <div className={`min-w-full max-w-full sm:min-w-[calc((100%-0.75rem)/2)] lg:min-w-[calc((100%-2.25rem)/4)] ${departureRange?.from ? "w-max" : "w-0"}`}>
            <DateRangeFilter
              className="min-w-full"
              label="Departure time"
              dateRange={departureRange}
              onDateRangeChange={setDepartureRange}
            />
          </div>

          <div className={`min-w-full max-w-full sm:min-w-[calc((100%-0.75rem)/2)] lg:min-w-[calc((100%-2.25rem)/4)] ${arrivalRange?.from ? "w-max" : "w-0"}`}>
            <DateRangeFilter
              className="min-w-full"
              label="Arrival time"
              dateRange={arrivalRange}
              onDateRangeChange={setArrivalRange}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit">
            <Search aria-hidden="true" />
            Search
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset filters
          </Button>
        </div>
      </form>
    </Card>
  );
}
