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
    <footer className="flex flex-col gap-4 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
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

      <nav aria-label={t("pagination")} className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isPending}
          onClick={() => setPage((current) => current - 1)}
        >
          <ChevronLeft className="rtl:rotate-180" aria-hidden="true" />
          {t("previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
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
