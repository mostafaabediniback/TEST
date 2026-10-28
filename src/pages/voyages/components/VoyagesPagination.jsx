import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";

export default function VoyagesPagination({
  page,
  pageSize,
  pageCount,
  total,
  isPending,
  setPage,
  setPageSize,
}) {
  const { t, formatNumber } = useLocale();

  return (
    <footer className="flex flex-col gap-3 rounded-xl border bg-background p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <label htmlFor="voyages-page-size" className="text-sm">
          {t("rowsPerPage")}
        </label>
        <select
          id="voyages-page-size"
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {formatNumber(size)}
            </option>
          ))}
        </select>

        <span className="text-xs text-muted-foreground" role="status">
          {t("pageOfPagesTotal", {
            page: formatNumber(page),
            pages: formatNumber(pageCount),
            total: formatNumber(total),
          })}
        </span>
      </div>

      <nav aria-label={t("pagination")} className="flex w-full gap-2 sm:w-auto sm:shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 sm:flex-none"
          disabled={page <= 1 || isPending}
          onClick={() => setPage((current) => current - 1)}
        >
          <ChevronLeft className="rtl:rotate-180" aria-hidden="true" />
          {t("previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 sm:flex-none"
          disabled={page >= pageCount || isPending}
          onClick={() => setPage((current) => current + 1)}
        >
          {t("next")}
          <ChevronRight className="rtl:rotate-180" aria-hidden="true" />
        </Button>
      </nav>
    </footer>
  );
}
