import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFilters } from "@/context/FilterContext";
import { useLocale } from "@/context/LocaleContext";
import {
  ALL_VESSEL_TYPES,
  VESSEL_TYPE_GROUPS,
  getVesselTypeGroupState,
  updateVesselTypeSelection,
} from "@/lib/vesselTypes";

function FilterCheckbox({ checked, indeterminate = false, label, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onChange={(event) => onChange(event.target.checked)}
      className="size-3.5 shrink-0 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    />
  );
}

function VesselSymbol({ color }) {
  return (
    <svg viewBox="0 0 24 16" className="h-4 w-5 shrink-0" aria-hidden="true">
      <path
        d="M2 2 22 8 2 14 6 8Z"
        fill={color}
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

export function VesselTypeFilter() {
  const { vesselTypes, setVesselTypes } = useFilters();
  const { t, direction, isRtl, formatNumber } = useLocale();
  const [expanded, setExpanded] = useState(["cargo", "tankers", "passenger"]);
  const selected = useMemo(() => new Set(vesselTypes), [vesselTypes]);
  const contentId = useId();
  const active = vesselTypes.length !== ALL_VESSEL_TYPES.length;
  const toggleTypes = (types, checked) =>
    setVesselTypes((current) =>
      updateVesselTypeSelection(current, types, checked),
    );
  const toggleGroup = (id) =>
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("vesselType")}
            title={t("vesselType")}
            className={
              active ? "relative bg-primary/10 text-primary" : "relative"
            }
          />
        }
      >
        <Ship className="size-5" aria-hidden="true" />
        {active && (
          <span
            aria-hidden="true"
            className="absolute -end-1 -top-1 min-w-4 rounded-full bg-primary px-1 text-[9px] text-primary-foreground"
          >
            {formatNumber(vesselTypes.length)}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        side={isRtl ? "right" : "left"}
        align="start"
        dir={direction}
        className="w-72 max-w-[calc(100vw-5rem)] max-h-[min(80dvh,var(--available-height))] gap-0 overflow-hidden p-0 text-start"
      >
        <PopoverTitle className="shrink-0 border-b bg-muted/60 px-3 py-2 text-xs">
          {t("vesselType")}
        </PopoverTitle>
        <div className="min-h-0 max-h-[65dvh] overflow-y-auto px-2 py-1">
          {VESSEL_TYPE_GROUPS.map((group) => {
            const { checked, indeterminate } = getVesselTypeGroupState(
              vesselTypes,
              group,
            );
            const isExpanded = expanded.includes(group.id);
            const hasChildren = group.types.length > 1;
            const groupLabel = t(`vesselTypeGroups.${group.id}`, {
              defaultValue: group.label,
            });
            const groupId = `${contentId}-${group.id}`;
            return (
              <div key={group.id} className="py-0.5">
                <div className="flex items-center gap-2 rounded px-1 py-1 hover:bg-accent/70 has-checked:bg-accent/60 has-checked:text-accent-foreground transition-colors">
                  <FilterCheckbox
                    checked={checked}
                    indeterminate={indeterminate}
                    label={groupLabel}
                    onChange={(value) => toggleTypes(group.types, value)}
                  />
                  <VesselSymbol color={group.color} />
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      aria-expanded={isExpanded}
                      aria-controls={groupId}
                      className="flex min-w-0 flex-1 items-center justify-between gap-1 rounded text-start text-xs focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span>{groupLabel}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`size-3 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleTypes(group.types, !checked)}
                      className="min-w-0 flex-1 rounded text-start text-xs focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      {groupLabel}
                    </button>
                  )}
                </div>
                {hasChildren && isExpanded && (
                  <div id={groupId} className="ms-7 grid gap-0.5 pb-1">
                    {group.types.map((type) => (
                      <label
                        key={type}
                        className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-[11px] text-muted-foreground hover:bg-accent/70 has-checked:bg-accent/60 has-checked:text-accent-foreground transition-colors hover:text-accent-foreground"
                      >
                        <FilterCheckbox
                          checked={selected.has(type)}
                          label={t(`vesselTypeNames.${type}`, {
                            defaultValue: type,
                          })}
                          onChange={(value) => toggleTypes([type], value)}
                        />
                        <span>
                          {t(`vesselTypeNames.${type}`, { defaultValue: type })}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex shrink-0 gap-3 border-t px-3 py-2">
          <button
            type="button"
            className="rounded text-xs text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            onClick={() => setVesselTypes([...ALL_VESSEL_TYPES])}
          >
            {t("selectAllVesselTypes")}
          </button>
          <button
            type="button"
            className="rounded text-xs text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            onClick={() => setVesselTypes([])}
          >
            {t("unselectAllVesselTypes")}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
