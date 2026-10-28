import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { isPlainLinkClick } from "@/lib/navigation";
import { useLocale } from "@/context/LocaleContext";

export default function ShipTrackControls({ shipName, track, onHide, detailsNavigation, onDetails, onClose }) {
  const { t, direction } = useLocale();
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[1000] flex justify-center">
      <section
        dir={direction}
        aria-label={t("pastTrack")}
        className="pointer-events-auto w-full max-w-xl rounded-xl border bg-white/95 p-3 shadow-lg backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 basis-full sm:flex-1 sm:basis-auto">
            <p className="text-xs font-medium text-orange-700">{t("pastTrack")}</p>
            <p title={shipName} className="truncate text-sm font-semibold text-slate-900">{shipName}</p>
          </div>
          <button
            type="button"
            aria-pressed="true"
            onClick={onHide}
            className="rounded-md border border-orange-500 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100"
          >
            {t("hidePastTrack")}
          </button>
          <Link
            {...(detailsNavigation ?? { to: "/ships" })}
            onClick={(event) => {
              if (onDetails && isPlainLinkClick(event)) {
                event.preventDefault();
                onDetails();
              }
            }}
            className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            {t("viewDetails")}
          </Link>
          <button
            type="button"
            aria-label={t("closeSelection")}
            onClick={onClose}
            className="ms-auto rounded-full p-2 text-slate-600 hover:bg-slate-100 sm:ms-0"
          >
            <X size={16} />
          </button>
        </div>
        <div role="status" aria-live="polite" className="text-xs">
          {track.isFetching && <p className="mt-2 text-slate-600">{t("loadingPastTrack")}</p>}
          {track.isError && (
            <p className="mt-2 text-amber-700">
              {t("loadPastTrackError")}{" "}
              <button type="button" onClick={() => track.refetch()} className="underline">
                {t("retryPastTrack")}
              </button>
            </p>
          )}
          {track.isSuccess && !track.isFetching && track.path.length < 2 && (
            <p className="mt-2 text-slate-600">{t("noPastTrack")}</p>
          )}
        </div>
      </section>
    </div>
  );
}
