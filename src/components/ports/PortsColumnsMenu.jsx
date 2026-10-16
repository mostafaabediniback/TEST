import { Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocale } from "@/context/LocaleContext";

export default function PortsColumnsMenu({
  columns,
  visibleColumns,
  onToggle,
}) {
  const { t, formatNumber, direction } = useLocale();

  return (
    <div className="flex justify-end">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" className="h-10" />}>
          <Columns3 aria-hidden="true" />
          {t("Columns")} ({formatNumber(visibleColumns.length)}/
          {formatNumber(columns.length)})
        </PopoverTrigger>

        <PopoverContent
          align="end"
          dir={direction}
          className="w-64 max-w-[calc(100vw-2rem)] text-start"
        >
          <PopoverTitle>{t("Visible columns")}</PopoverTitle>
          <PopoverDescription>
            {t("Choose fields shown in the table.")}
          </PopoverDescription>

          <div className="space-y-1">
            {columns.map((column) => (
              <label
                key={column.key}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground has-checked:bg-accent/60 has-checked:text-accent-foreground transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(column.key)}
                  disabled={column.key === "name"}
                  onChange={(event) =>
                    onToggle(column.key, event.target.checked)
                  }
                  className="size-4 accent-primary disabled:cursor-not-allowed"
                />

                <span>{t(column.labelKey)}</span>

                {column.key === "name" && (
                  <span className="ms-auto text-xs text-muted-foreground">
                    {t("Required")}
                  </span>
                )}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}