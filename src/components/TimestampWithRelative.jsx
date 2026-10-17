import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { formatRelativeTime, formatTimestamp, timestampToDate } from "@/lib/dateTime";
import { cn } from "@/lib/utils";

export default function TimestampWithRelative({
  value,
  unit = "seconds",
  options,
  fallback = "—",
  className,
}) {
  const { locale } = useLocale();
  const [now, setNow] = useState(Date.now);
  const date = timestampToDate(value, { unit });
  const milliseconds = date?.getTime();

  useEffect(() => {
    if (milliseconds == null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [milliseconds]);

  if (!date) return <span className="text-muted-foreground">{fallback}</span>;

  const absolute = formatTimestamp(date, { options });
  const relative = formatRelativeTime(date, { locale, now: new Date(now) });

  return (
    <span className={cn("inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 align-middle", className)}>
      <time dateTime={date.toISOString()} className="tabular-nums" dir="auto">
        {absolute}
      </time>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[11px] font-medium leading-4 text-muted-foreground">
        <Clock3 className="size-3 shrink-0" aria-hidden="true" />
        <span dir="auto">{relative}</span>
      </span>
    </span>
  );
}
