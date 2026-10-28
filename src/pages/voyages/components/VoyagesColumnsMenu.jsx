import { useState } from "react";
import DropdownDoneButton from "@/components/DropdownDoneButton";
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
import { columns } from "../voyagesConstants";

export default function VoyagesColumnsMenu({
  displayedColumns,
  visibleColumns,
  toggleColumn,
}) {
  const { t, formatNumber, direction } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" className="h-10" />}>
        <Columns3 aria-hidden="true" />
        {t("Columns")} ({formatNumber(displayedColumns.length)}/
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
        <div className="min-h-0 overflow-y-auto overscroll-contain space-y-1">
          {columns.map((column) => (
            <label
              key={column.key}
              className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={visibleColumns.includes(column.key)}
                onChange={(event) =>
                  toggleColumn(column.key, event.target.checked)
                }
                className="size-4 accent-primary"
              />
              <span>{column.labelKey ? t(column.labelKey) : column.label}</span>
            </label>
          ))}
        </div>
        <DropdownDoneButton onClick={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
