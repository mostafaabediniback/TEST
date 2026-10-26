import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { faIR, getDateLib } from "@daypicker/persian";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PERSIAN_DATE_LIB = getDateLib({
  locale: faIR,
  numerals: "arabext",
});

function dateOnly(date) {
  if (!date) return undefined;

  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function toLocalDay(value) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
  ).getTime();
}

/**
 * Range mode (default): dateRange / onDateRangeChange use { from, to }.
 * Single mode: date / onDateChange use one Date.
 * Selected dates are set to local midnight; no time is selected.
 */
export default function DateRangeFilter({
  mode = "range",
  calendar = "auto",
  date,
  onDateChange,
  dateRange,
  onDateRangeChange,
  className,
  label: fieldLabel,
}) {
  const { locale } = useLocale();
  const [calendarOverride, setCalendarOverride] = useState(null);
  const [activeTab, setActiveTab] = useState("from");

  const defaultCalendar =
    calendar === "auto"
      ? locale === "fa"
        ? "persian"
        : "gregorian"
      : calendar;

  const calendarType = calendarOverride ?? defaultCalendar;
  const isPersian = calendarType === "persian";
  const isSingle = mode === "single";

  const text = isPersian
    ? {
        from: "از",
        to: "تا",
        single: "انتخاب تاریخ",
        range: "انتخاب بازهٔ تاریخ",
        end: "انتخاب پایان بازه",
        persianCalendar: "شمسی",
        gregorianCalendar: "میلادی",
        clear: "پاک کردن تاریخ انتخاب‌شده",
      }
    : {
        from: "From",
        to: "To",
        single: "Select date",
        range: "Select date range",
        end: "Select end",
        persianCalendar: "Shamsi",
        gregorianCalendar: "Gregorian",
        clear: "Clear selected date",
      };

  const formatDateLabel = (value) =>
    isPersian
      ? PERSIAN_DATE_LIB.format(value, "d MMMM yyyy")
      : format(value, "MMM d, yyyy");

  const separator = isPersian ? "تا" : "›";
  const activeDate = isSingle ? date : dateRange?.[activeTab];
  const hasValue = isSingle
    ? Boolean(date)
    : Boolean(dateRange?.from || dateRange?.to);

  function handleClear(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isSingle) {
      onDateChange?.(undefined);
      return;
    }

    onDateRangeChange?.({ from: undefined, to: undefined });
    setActiveTab("from");
  }

  const isRangeMiddle = (day) => {
    if (!dateRange?.from || !dateRange?.to) return false;

    const dayTime = toLocalDay(day);
    return (
      dayTime > toLocalDay(dateRange.from) &&
      dayTime < toLocalDay(dateRange.to)
    );
  };

  function handleDateSelect(selectedDate) {
    if (!selectedDate) return;

    const selected = dateOnly(selectedDate);

    if (isSingle) {
      onDateChange?.(selected);
      return;
    }

    const nextRange = {
      ...dateRange,
      [activeTab]: selected,
    };

    if (activeTab === "from" && nextRange.to && nextRange.from > nextRange.to) {
      nextRange.to = selected;
    }

    if (activeTab === "to" && nextRange.from && nextRange.to < nextRange.from) {
      nextRange.from = selected;
    }

    onDateRangeChange?.(nextRange);

    if (activeTab === "from") {
      setActiveTab("to");
    }
  }

  const label = isSingle
    ? date
      ? formatDateLabel(date)
      : (fieldLabel ?? text.single)
    : dateRange?.from && dateRange?.to
      ? `${formatDateLabel(dateRange.from)}  ${separator}  ${formatDateLabel(dateRange.to)}`
      : dateRange?.from
        ? `${formatDateLabel(dateRange.from)}  ${separator}  ${text.end}`
        : (fieldLabel ?? text.range);

  const displayLabel =
    fieldLabel && hasValue ? `${fieldLabel}: ${label}` : label;

  return (
    <Popover>
      <div className="relative inline-flex w-max min-w-0 min-w-full">
        <PopoverTrigger
          title={displayLabel}
          aria-label={fieldLabel ?? label}
          render={
            <Button
              variant="outline"
              className={cn(
                "h-auto min-h-8 w-max min-w-0 max-w-full justify-start py-1 pe-9 text-start font-normal whitespace-normal",
                className,
              )}
            />
          }
        >
          <CalendarIcon className="me-2 h-4 w-4 shrink-0" />
          <span className={cn("min-w-0", !hasValue && "text-muted-foreground")}>
            {displayLabel}
          </span>
        </PopoverTrigger>

        {hasValue && (
          <button
            type="button"
            aria-label={text.clear}
            title={text.clear}
            onClick={handleClear}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <PopoverContent
        dir={isPersian ? "rtl" : undefined}
        className="w-[min(95vw,380px)] p-0"
        align="start"
      >
        <div className="border-t p-2">
          <div
            className="mx-auto flex w-fit rounded-lg bg-slate-100 p-1"
            role="group"
            aria-label="Calendar type"
          >
            <button
              type="button"
              aria-pressed={isPersian}
              onClick={() => setCalendarOverride("persian")}
              className={cn(
                "rounded-md px-4 py-2 text-sm transition-colors",
                isPersian
                  ? "bg-white font-medium text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {text.persianCalendar}
            </button>

            <button
              type="button"
              aria-pressed={!isPersian}
              onClick={() => setCalendarOverride("gregorian")}
              className={cn(
                "rounded-md px-4 py-2 text-sm transition-colors",
                !isPersian
                  ? "bg-white font-medium text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {text.gregorianCalendar}
            </button>
          </div>
        </div>

        {!isSingle && (
          <div className="grid grid-cols-2 border-b">
            <button
              type="button"
              onClick={() => setActiveTab("from")}
              className={`border-b-2 px-4 py-3 text-sm ${
                activeTab === "from"
                  ? "border-slate-900 font-medium text-slate-900"
                  : "border-transparent text-slate-500"
              }`}
            >
              {text.from}{" "}
              {dateRange?.from ? formatDateLabel(dateRange.from) : ""}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("to")}
              className={`border-b-2 px-4 py-3 text-sm ${
                activeTab === "to"
                  ? "border-slate-900 font-medium text-slate-900"
                  : "border-transparent text-slate-500"
              }`}
            >
              {text.to}{" "}
              {dateRange?.to ? formatDateLabel(dateRange.to) : ""}
            </button>
          </div>
        )}

        <div className="p-2">
          <Calendar
            key={`${calendarType}-${isSingle ? "single" : activeTab}`}
            calendar={calendarType}
            dir={isPersian ? "rtl" : undefined}
            mode="single"
            selected={activeDate}
            onSelect={handleDateSelect}
            defaultMonth={activeDate ?? (isSingle ? undefined : dateRange?.from)}
            modifiers={{
              range_start: dateRange?.from,
              range_end: dateRange?.to,
              range_middle: isRangeMiddle,
            }}
            modifiersClassNames={{
              range_start:
                "!bg-primary !text-primary-foreground rounded-s-md",
              range_end:
                "!bg-primary !text-primary-foreground rounded-e-md",
              range_middle:
                "!bg-accent !text-accent-foreground rounded-none",
            }}
            className="w-full"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
