import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function PortsFilters({
  filters,
  onFilterChange,
  onSearch,
  onReset,
}) {
  return (
    <Card className="p-4">
      <form onSubmit={onSearch} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterInput
            label="Port name"
            value={filters.name}
            onChange={(value) => onFilterChange("name", value)}
          />

          <FilterInput
            label="Alternative name"
            value={filters.alternative_name}
            onChange={(value) => onFilterChange("alternative_name", value)}
          />

          <FilterInput
            label="UN/LOCODE"
            value={filters.unlo_code}
            onChange={(value) => onFilterChange("unlo_code", value)}
          />

          <FilterInput
            label="Country name"
            value={filters.country_name}
            onChange={(value) => onFilterChange("country_name", value)}
          />

          <FilterInput
            label="Country code"
            value={filters.country_code}
            onChange={(value) => onFilterChange("country_code", value)}
          />

          <FilterInput
            label="Timezone"
            value={filters.timezone}
            onChange={(value) => onFilterChange("timezone", value)}
          />

          <FilterInput
            label="Port ID"
            type="number"
            value={filters.id}
            onChange={(value) => onFilterChange("id", value)}
          />

          <FilterInput
            label="Gallery URL"
            value={filters.gallery_url}
            onChange={(value) => onFilterChange("gallery_url", value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <RangeInputs
            label="Longitude"
            minValue={filters.lon_min}
            maxValue={filters.lon_max}
            onMinChange={(value) => onFilterChange("lon_min", value)}
            onMaxChange={(value) => onFilterChange("lon_max", value)}
          />

          <RangeInputs
            label="Latitude"
            minValue={filters.lat_min}
            maxValue={filters.lat_max}
            onMinChange={(value) => onFilterChange("lat_min", value)}
            onMaxChange={(value) => onFilterChange("lat_max", value)}
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

function FilterInput({ label, value, onChange, type = "text" }) {
  return (
    <Input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={label}
      aria-label={label}
    />
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
