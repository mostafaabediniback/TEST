import { useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCarFilters } from "@/context/CarFilterContext";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";

export function SearchBox({ className }) {
  const { search, setSearch } = useCarFilters();
  const { t } = useLocale();
  const inputRef = useRef(null);

  return (
    <div role="search" aria-label={t("Search vehicles")} className={cn("relative w-full", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t("Search driver, plate, or vehicle ID...")}
        aria-label={t("Search vehicles")}
        className="h-10 w-full bg-background ps-10 pe-10 text-start [&::-webkit-search-cancel-button]:hidden"
      />
      {search ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => {
            setSearch("");
            inputRef.current?.focus();
          }}
          className="absolute end-1 top-1/2 size-8 -translate-y-1/2"
          aria-label={t("Clear search")}
          title={t("Clear search")}
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
