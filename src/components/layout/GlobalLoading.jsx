import { LoaderCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useLoading } from "@/context/LoadingContext";
import { useLocale } from "@/context/LocaleContext";

export function GlobalLoading() {
  const { isLoading } = useLoading();
  const { pathname } = useLocation();
  const { locale } = useLocale();

  if (!isLoading || pathname === "/map" || pathname.startsWith("/map/")) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/60 backdrop-blur-sm" role="status" aria-live="polite">
      <LoaderCircle className="size-8 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">{locale === "fa" ? "در حال بارگذاری" : "Loading"}</span>
    </div>
  );
}
