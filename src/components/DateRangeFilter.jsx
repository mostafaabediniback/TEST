import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

export default function DateRangeFilter({ dateRange, onDateRangeChange, className }) {
  const [activeTab, setActiveTab] = useState("from");
  const activeDate = dateRange?.[activeTab];

  function handleDateSelect(date) {
    if (!date) return;

    const currentTime = getTime(
      dateRange?.[activeTab],
      activeTab === "from" ? "08:30" : "17:00"
    );

    const nextRange = {
      ...dateRange,
      [activeTab]: setDateTime(date, currentTime),
    };

    if (activeTab === "from" && nextRange.to && nextRange.from > nextRange.to) {
      nextRange.to = setDateTime(date, getTime(nextRange.to, "17:00"));
    }

    if (activeTab === "to" && nextRange.from && nextRange.to < nextRange.from) {
      nextRange.from = setDateTime(
        date,
        getTime(nextRange.from, "08:30")
      );
    }

    onDateRangeChange(nextRange);
  }

  function handleTimeSelect(time) {
    if (!activeDate) return;

    onDateRangeChange({
      ...dateRange,
      [activeTab]: setDateTime(activeDate, time),
    });
  }

  const label =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "MMM d, yyyy HH:mm")}  ›  ${format(dateRange.to, "MMM d, yyyy HH:mm")}`
      : dateRange?.from
        ? `${format(dateRange.from, "MMM d, yyyy HH:mm")}  ›  Select end`
        : "Select date and time range";

  return (
    <Popover>
      <PopoverTrigger
        title={label}
        render={
          <Button
            variant="outline"
            className={cn(
              "h-auto min-h-8 w-max min-w-0 max-w-full justify-start py-1 text-left font-normal whitespace-normal",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        <span className="min-w-0">{label}</span>
      </PopoverTrigger>

      <PopoverContent className="w-[min(95vw,380px)] p-0" align="start">
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
            From {dateRange?.from ? format(dateRange.from, "MMM d") : ""}
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
            To {dateRange?.to ? format(dateRange.to, "MMM d") : ""}
          </button>
        </div>

        <div className="flex items-start gap-1 p-2">
          <Calendar
            mode="single"
            selected={activeDate}
            onSelect={handleDateSelect}
            month={activeDate}
            onMonthChange={(month) => {
              if (!activeDate) return;

              onDateRangeChange({
                ...dateRange,
                [activeTab]: setDateTime(
                  month,
                  getTime(activeDate, activeTab === "from" ? "08:30" : "17:00")
                ),
              });
            }}
            className="min-w-0 flex-1"
          />

          <div
            className="h-[400px] w-[78px] shrink-0 space-y-1 overflow-y-auto"
            aria-label="Choose time"
          >
            {TIMES.map((time) => {
              const selectedTime = getTime(
                activeDate,
                activeTab === "from" ? "08:30" : "17:00"
              );

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
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}