import { useState } from "react";
import { format } from "date-fns";
import { faIR, getDateLib } from "@daypicker/persian";
import { useLocale } from "@/context/LocaleContext";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PERSIAN_DATE_LIB = getDateLib({ locale: faIR, numerals: "arabext" });

const TIMES = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
});

function setDateTime(date, time) {
  if (!date || !time) return undefined;

  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);

  return result;
}

function getTime(date, fallback) {
  return date ? format(date, "HH:mm") : fallback;
}

/**
 * Range mode (default): dateRange / onDateRangeChange use { from, to }.
 * Single mode: date / onDateChange use one Date; convert with toUnixSeconds
 * at the API boundary, just like the existing range fields.
 * Calendar defaults to Persian for fa and Gregorian for other app languages.
 * Override with calendar="persian" or calendar="gregorian"; outputs stay Dates.
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
  const calendarType = calendar === "auto"
    ? (locale === "fa" ? "persian" : "gregorian")
    : calendar;
  const isPersian = calendarType === "persian";
  const text = isPersian
    ? {
      from: "از",
      to: "تا",
      single: "انتخاب تاریخ و ساعت",
      range: "انتخاب بازهٔ تاریخ و ساعت",
      end: "انتخاب پایان بازه",
      time: "انتخاب ساعت",
    }
    : {
      from: "From",
      to: "To",
      single: "Select date and time",
      range: "Select date and time range",
      end: "Select end",
      time: "Choose time",
    };
  const formatDateLabel = (value, withTime = true) => isPersian
    ? PERSIAN_DATE_LIB.format(value, withTime ? "d MMMM yyyy، HH:mm" : "d MMMM")
    : format(value, withTime ? "MMM d, yyyy HH:mm" : "MMM d");
  const separator = isPersian ? "تا" : "›";
  const [activeTab, setActiveTab] = useState("from");
  const isSingle = mode === "single";
  const activeDate = isSingle ? date : dateRange?.[activeTab];
  const hasValue = isSingle ? Boolean(date) : Boolean(dateRange?.from);
  const defaultTime = isSingle || activeTab === "from" ? "08:30" : "17:00";

  function handleDateSelect(date) {
    if (!date) return;

    const currentTime = getTime(activeDate, defaultTime);

    if (isSingle) {
      onDateChange(setDateTime(date, currentTime));
      return;
    }

    const nextRange = {
      ...dateRange,
      [activeTab]: setDateTime(date, currentTime),
    };

    if (activeTab === "from" && nextRange.to && nextRange.from > nextRange.to) {
      nextRange.to = setDateTime(date, getTime(nextRange.to, "17:00"));
    }

    if (activeTab === "to" && nextRange.from && nextRange.to < nextRange.from) {
      nextRange.from = setDateTime(date, getTime(nextRange.from, "08:30"));
    }

    onDateRangeChange(nextRange);
  }

  function handleTimeSelect(time) {
    if (!activeDate) return;

    if (isSingle) {
      onDateChange(setDateTime(activeDate, time));
      return;
    }

    onDateRangeChange({
      ...dateRange,
      [activeTab]: setDateTime(activeDate, time),
    });
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
      <PopoverTrigger
        title={displayLabel}
        aria-label={fieldLabel}
        render={
          <Button
            variant="outline"
            className={cn(
              "h-auto min-h-8 w-max min-w-0 max-w-full justify-start py-1 text-start font-normal whitespace-normal",
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

      <PopoverContent
        dir={isPersian ? "rtl" : undefined}
        className="w-[min(95vw,380px)] p-0"
        align="start"
      >
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
              {text.from} {dateRange?.from ? formatDateLabel(dateRange.from, false) : ""}
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
              {text.to} {dateRange?.to ? formatDateLabel(dateRange.to, false) : ""}
            </button>
          </div>
        )}

        <div className="flex items-start gap-1 p-2">
          <Calendar
            key={`${calendarType}-${isSingle ? "single" : activeTab}`}
            calendar={calendarType}
            dir={isPersian ? "rtl" : undefined}
            mode="single"
            selected={activeDate}
            onSelect={handleDateSelect}
            defaultMonth={activeDate ?? (isSingle ? undefined : dateRange?.from)}
            className="min-w-0 flex-1"
          />

          <div
            className="h-[400px] w-[78px] shrink-0 space-y-1 overflow-y-auto"
            aria-label={text.time}
            dir="ltr"
          >
            {TIMES.map((time) => {
              const selectedTime = getTime(activeDate, defaultTime);

              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`w-full rounded-md border px-2 py-1.5 text-sm ${
                    selectedTime === time
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:bg-slate-100"
                  }`}
                >
                  {isPersian ? time.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]) : time}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
