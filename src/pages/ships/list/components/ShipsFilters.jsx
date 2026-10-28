import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import VesselTypeDropdown from "@/components/ships/VesselTypeDropdown";
import CountryDropdown from "@/components/ships/CountryDropdown";

export default function ShipsFilters({
  filters,
  onFilterChange,
  onSearch,
  onReset,
}) {
  return (
    <Card className="p-4">
      <form onSubmit={onSearch} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            value={filters.name ?? ""}
            onChange={(event) => onFilterChange("name", event.target.value)}
            placeholder="Vessel name"
            aria-label="Vessel name"
          />

          <Input
            value={filters.imo ?? ""}
            onChange={(event) => onFilterChange("imo_like", event.target.value)}
            placeholder="IMO"
            aria-label="IMO"
          />

          <CountryDropdown
            selected={filters.flag ?? ""}
            onChange={(country) => onFilterChange("flag", country ?? "")}
          />

          <VesselTypeDropdown
            selected={filters.vessel_type ?? []}
            onChange={(selected) => onFilterChange("vessel_type", selected)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit">
            <Search aria-hidden="true" />
            Search
          </Button>

          <Button type="button" variant="outline" onClick={onReset}>
            Reset filters
          </Button>
        </div>
      </form>
    </Card>
  );
}
