import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import VesselTypeDropdown from "@/components/ships/VesselTypeDropdown";
import CountryDropdown from "@/components/ships/CountryDropdown";
import ImoFilter from "./ImoFilter";

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
            value={filters.name}
            onChange={(event) => onFilterChange("name", event.target.value)}
            placeholder="Vessels name"
            aria-label="Vessels name"
          />
          
          <Input
            value={filters.imo}
            onChange={(event) => onFilterChange("imo", event.target.value)}
            placeholder="IMO"
            aria-label="IMO"
          />

          <CountryDropdown
            selected={filters.flag ?? ""}
            onChange={(country) => onFilterChange("flag", country ?? "")}
          />

          <VesselTypeDropdown
            selected={filters.vessel_type}
            onChange={(selected) => onFilterChange("vessel_type", selected)}
          />

          {/* <Input
            value={filters.vessel_class}
            onChange={(event) =>
              onFilterChange("vessel_class", event.target.value)
            }
            placeholder="Vessel class"
            aria-label="Vessel class"
          />

          <Input
            value={filters.vessel_maker}
            onChange={(event) =>
              onFilterChange("vessel_maker", event.target.value)
            }
            placeholder="Vessel maker"
            aria-label="Vessel maker"
          /> */}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* <ImoFilter
            value={filters.imo}
            onChange={(value) => onFilterChange("imo", value)}
          /> */}
          {/* <RangeInputs
            label="Year built"
            minValue={filters.yob_from}
            maxValue={filters.yob_to}
            onMinChange={(value) => onFilterChange("yob_from", value)}
            onMaxChange={(value) => onFilterChange("yob_to", value)}
          />

          <RangeInputs
            label="Length"
            minValue={filters.loa_min}
            maxValue={filters.loa_max}
            onMinChange={(value) => onFilterChange("loa_min", value)}
            onMaxChange={(value) => onFilterChange("loa_max", value)}
          />

          <RangeInputs
            label="Width"
            minValue={filters.width_min}
            maxValue={filters.width_max}
            onMinChange={(value) => onFilterChange("width_min", value)}
            onMaxChange={(value) => onFilterChange("width_max", value)}
          /> */}

          {/* <RangeInputs
            label="Draft"
            minValue={filters.draft_min}
            maxValue={filters.draft_max}
            onMinChange={(value) => onFilterChange("draft_min", value)}
            onMaxChange={(value) => onFilterChange("draft_max", value)}
          />

          <RangeInputs
            label="DWT"
            minValue={filters.dwt_min}
            maxValue={filters.dwt_max}
            onMinChange={(value) => onFilterChange("dwt_min", value)}
            onMaxChange={(value) => onFilterChange("dwt_max", value)}
          /> */}
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

function RangeInputs({ label, minValue, maxValue, onMinChange, onMaxChange }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-sm font-medium">{label}</legend>

      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={minValue}
          onChange={(event) => onMinChange(event.target.value)}
          placeholder="Min"
          aria-label={`${label} minimum`}
        />

        <Input
          type="number"
          value={maxValue}
          onChange={(event) => onMaxChange(event.target.value)}
          placeholder="Max"
          aria-label={`${label} maximum`}
        />
      </div>
    </fieldset>
  );
}
