import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";

export default function PortsPagination({
  page,
  pageCount,
  pageSize,
  total,
  isPending,
  onPageChange,
  onPageSizeChange,
}) {
  const { t, formatNumber } = useLocale();

  return (
    <footer className="flex flex-col gap-4 rounded-xl border bg-background p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <label htmlFor="ports-page-size" className="text-sm">
          {t("rowsPerPage")}
        </label>

        <select
          id="ports-page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
        >
          {[5,10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {formatNumber(size)}
            </option>
          ))}
        </select>

        <span className="min-w-0 text-xs text-muted-foreground" role="status">
          {t("pageOfPagesTotal", {
            page: formatNumber(page),
            pages: formatNumber(pageCount),
            total: formatNumber(total),
          })}
        </span>
      </div>

      <nav
        aria-label={t("pagination")}
        className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0"
      >
        <Button
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 sm:flex-none"
          disabled={page <= 1 || isPending}
          onClick={() => onPageChange((current) => current - 1)}
        >
          <ChevronLeft className="rtl:rotate-180" aria-hidden="true" />
          {t("previous")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 sm:flex-none"
          disabled={page >= pageCount || isPending}
          onClick={() => onPageChange((current) => current + 1)}
        >
          {t("next")}
          <ChevronRight className="rtl:rotate-180" aria-hidden="true" />
        </Button>
      </nav>
    </footer>
  );
}
