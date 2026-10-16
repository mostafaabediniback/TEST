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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterInput
            label="Voyage ID"
            value={filters.id}
            onChange={(value) => updateFilter("id", value)}
          />
          <FilterInput
            label={t("shipId")}
            value={filters.ship_id}
            onChange={(value) => updateFilter("ship_id", value)}
          />
          <FilterInput
            label={t("departurePortId")}
            value={filters.departure_port_id}
            onChange={(value) => updateFilter("departure_port_id", value)}
          />
          <FilterInput
            label={t("arrivalPortId")}
            value={filters.arrival_port_id}
            onChange={(value) => updateFilter("arrival_port_id", value)}
          />

          <div className="min-w-0 space-y-2 sm:col-span-2 lg:col-span-4">
            <span className="block text-sm font-medium">Departure time</span>
            <DateRangeFilter
              dateRange={departureRange}
              onDateRangeChange={setDepartureRange}
            />
          </div>

          <div className="min-w-0 space-y-2 sm:col-span-2 lg:col-span-4">
            <span className="block text-sm font-medium">Arrival time</span>
            <DateRangeFilter
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
