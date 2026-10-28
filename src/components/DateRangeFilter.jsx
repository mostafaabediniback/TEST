import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { enUS as enUSPersian, faIR, getDateLib } from "@daypicker/persian";
import { format } from "date-fns";
import { arSA, enUS, faIR as faIRGregorian } from "date-fns/locale";
import { CalendarIcon, Check, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const DATE_TEXT = {
  fa: {
    from: "از",
    to: "تا",
    single: "انتخاب تاریخ",
    range: "انتخاب بازهٔ تاریخ",
    start: "تاریخ شروع",
    end: "تاریخ پایان",
    persianCalendar: "شمسی",
    gregorianCalendar: "میلادی",
    calendarType: "نوع تقویم",
    previousMonth: "ماه قبل",
    nextMonth: "ماه بعد",
    clear: "پاک کردن تاریخ",
    done: "انجام شد",
    selectFrom: "ابتدا تاریخ شروع بازه را انتخاب کنید.",
    selectTo: "اکنون تاریخ پایان بازه را انتخاب کنید.",
  },
  ar: {
    from: "من",
    to: "إلى",
    single: "اختر التاريخ",
    range: "اختر الفترة الزمنية",
    start: "تاريخ البداية",
    end: "تاريخ النهاية",
    persianCalendar: "شمسي",
    gregorianCalendar: "ميلادي",
    calendarType: "نوع التقويم",
    previousMonth: "الشهر السابق",
    nextMonth: "الشهر التالي",
    clear: "مسح التاريخ",
    done: "تم",
    selectFrom: "اختر تاريخ بداية الفترة.",
    selectTo: "اختر تاريخ نهاية الفترة.",
  },
  en: {
    from: "From",
    to: "To",
    single: "Select date",
    range: "Select date range",
    start: "Start date",
    end: "End date",
    persianCalendar: "Shamsi",
    gregorianCalendar: "Gregorian",
    calendarType: "Calendar type",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    clear: "Clear date",
    done: "Done",
    selectFrom: "Choose the start date of your range.",
    selectTo: "Now choose the end date of your range.",
  },
};

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
  const { locale, direction } = useLocale();
  const [open, setOpen] = useState(false);
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
  const text = DATE_TEXT[locale] ?? DATE_TEXT.en;
  const calendarLocale = isPersian
    ? locale === "en" ? enUSPersian : faIR
    : locale === "fa" ? faIRGregorian : locale === "ar" ? arSA : enUS;
  const persianDateLib = getDateLib({
    locale: calendarLocale,
    numerals: locale === "en" ? "latn" : "arabext",
  });

  const formatDateLabel = (value, compact = false) =>
    isPersian
      ? persianDateLib.format(value, compact ? "yyyy/MM/dd" : "d MMMM yyyy")
      : format(value, compact ? "yyyy-MM-dd" : "PP", { locale: calendarLocale });

  const activeDate = isSingle ? date : dateRange?.[activeTab];
  const hasValue = isSingle
    ? Boolean(date)
    : Boolean(dateRange?.from || dateRange?.to);

  function handleOpenChange(nextOpen) {
    if (nextOpen && !isSingle) {
      setActiveTab(dateRange?.from && !dateRange?.to ? "to" : "from");
    }
    setOpen(nextOpen);
  }

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
      nextRange.to = undefined;
    }

    if (activeTab === "to" && nextRange.from && nextRange.to < nextRange.from) {
      nextRange.from = selected;
    }

    onDateRangeChange?.(nextRange);

    if (activeTab === "from") {
      setActiveTab("to");
    }
  }

  function selectionLabel(compact) {
    if (isSingle) {
      return date ? formatDateLabel(date, compact) : (fieldLabel ?? text.single);
    }
    if (!hasValue) return fieldLabel ?? text.range;

    const from = dateRange?.from ? formatDateLabel(dateRange.from, compact) : text.start;
    const to = dateRange?.to ? formatDateLabel(dateRange.to, compact) : text.end;
    return `${text.from} ${from} ${text.to} ${to}`;
  }

  const fullLabel = [hasValue && fieldLabel, selectionLabel(false)].filter(Boolean).join(": ");

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className="relative flex w-full min-w-0 max-w-full">
        <PopoverTrigger
          title={fullLabel}
          aria-label={fullLabel}
          render={
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-8 w-full min-w-0 justify-start gap-2 overflow-hidden text-start font-normal",
                hasValue && "pe-9",
                className,
              )}
            />
          }
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn("min-w-0 truncate", !hasValue && "text-muted-foreground")}>
            {selectionLabel(true)}
          </span>
        </PopoverTrigger>

        {hasValue && (
          <button
            type="button"
            aria-label={text.clear}
            title={text.clear}
            onClick={handleClear}
            className="absolute end-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <PopoverContent
        dir={direction}
        className="w-[min(22rem,calc(100vw-1rem))] max-w-[var(--available-width)] gap-0 overflow-y-auto p-0"
        align="start"
      >
        <div className="space-y-3 border-b p-3">
          <PopoverTitle className="text-sm font-medium">
            {fieldLabel ?? (isSingle ? text.single : text.range)}
          </PopoverTitle>
          <div
            className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
            role="group"
            aria-label={text.calendarType}
          >
            {[
              ["persian", text.persianCalendar],
              ["gregorian", text.gregorianCalendar],
            ].map(([type, label]) => (
              <button
                key={type}
                type="button"
                aria-pressed={calendarType === type}
                onClick={() => setCalendarOverride(type)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  calendarType === type
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {!isSingle && (
            <div className="grid grid-cols-2 gap-2" role="group" aria-label={text.range}>
              {[
                ["from", text.start],
                ["to", text.end],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex min-w-0 flex-col gap-1 rounded-lg border px-3 py-2 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    activeTab === tab ? "border-primary bg-primary/5" : "border-border hover:bg-accent",
                  )}
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="truncate text-xs font-medium">
                    {dateRange?.[tab] ? formatDateLabel(dateRange[tab]) : "—"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Calendar
          key={`${calendarType}-${isSingle ? "single" : activeTab}`}
          calendar={calendarType}
          locale={calendarLocale}
          numerals={locale === "fa" ? "arabext" : locale === "ar" ? "arab" : "latn"}
          dir={direction}
          labels={{
            labelPrevious: () => text.previousMonth,
            labelNext: () => text.nextMonth,
          }}
          mode="single"
          required
          fixedWeeks
          selected={activeDate}
          onSelect={handleDateSelect}
          defaultMonth={activeDate ?? (isSingle ? undefined : dateRange?.from)}
          modifiers={isSingle ? undefined : {
            range_start: dateRange?.from,
            range_end: dateRange?.to,
            range_middle: isRangeMiddle,
          }}
          className="w-full"
        />

        {!isSingle && (
          <p className="px-3 pb-3 text-xs text-muted-foreground" aria-live="polite">
            {activeTab === "from" ? text.selectFrom : text.selectTo}
          </p>
        )}

        <div className="sticky bottom-0 z-20 flex shrink-0 items-center justify-between gap-2 border-t bg-background p-3">
          <Button type="button" variant="ghost" size="sm" disabled={!hasValue} onClick={handleClear}>
            {text.clear}
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            <Check className="size-4" />
            {text.done}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
