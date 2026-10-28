import { Eye, Filter } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/context/LocaleContext";
import { VesselFlag } from "@/components/VesselFlag";

const imoStatusOptions = {
  any: {
    label: "Any IMO status",
    next: "has_imo",
    nextLabel: "Vessels with IMO",
  },
  has_imo: {
    label: "Vessels with IMO",
    next: "no_imo",
    nextLabel: "Vessels without IMO",
  },
  no_imo: {
    label: "Vessels without IMO",
    next: "any",
    nextLabel: "any IMO status",
  },
};

export default function ShipsTable({
  rows,
  columns,
  isPending,
  isError,
  error,
  filters,
  onImoStatusChange,
  getDetailsNavigation,
}) {
  const { t, direction } = useLocale();
  const messageColumnCount = columns.length + 1;
  const imoStatus = imoStatusOptions[filters?.imo_status]
    ? filters.imo_status
    : "any";
  const currentImoOption = imoStatusOptions[imoStatus];

  return (
    <Table>
      <TableHeader dir={direction} className="bg-muted/50">
        <TableRow>
          {columns.map(({ key, labelKey, label }) => (
            <TableHead
              key={key}
              className={key === "imo" ? "align-top" : undefined}
            >
              {key === "imo" ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    type="button"
                    variant={imoStatus === "any" ? "ghost" : "secondary"}
                    size="icon-sm"
                    title={`${currentImoOption.label}. Click to show ${currentImoOption.nextLabel}.`}
                    aria-label={`IMO filter: ${currentImoOption.label}. Click to show ${currentImoOption.nextLabel}.`}
                    onClick={() => onImoStatusChange(currentImoOption.next)}
                  >
                    <Filter
                      aria-hidden="true"
                      className={
                        imoStatus === "has_imo"
                          ? "text-primary"
                          : imoStatus === "no_imo"
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }
                    />
                  </Button>

                  <span>{t(labelKey)}</span>
                </div>
              ) : labelKey ? (
                t(labelKey)
              ) : (
                label
              )}
            </TableHead>
          ))}

          <TableHead>{t("viewDetails")}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {isPending ? (
          <TableRow>
            <TableCell
              colSpan={messageColumnCount}
              className="p-6 text-sm text-muted-foreground"
            >
              {t("loadingShips")}
            </TableCell>
          </TableRow>
        ) : isError ? (
          <TableRow>
            <TableCell
              colSpan={messageColumnCount}
              className="p-6 text-sm text-destructive"
            >
              {error?.message ?? t("loadShipsError")}
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={messageColumnCount}
              className="p-6 text-center text-sm text-muted-foreground"
            >
              {t("noShipsFound")}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((ship) => (
            <TableRow key={ship.id}>
              {columns.map(({ key }) => (
                <TableCell
                  key={key}
                  className={key === "name" ? "font-medium" : undefined}
                >
                  {key === "flag" ? (
                    ship.flag ? (
                      <VesselFlag country={ship.flag} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )
                  ) : key === "vessel_type_subtype" ? (
                    ship.vessel_type || ship.vessel_subtype ? (
                      <>
                        {ship.vessel_type || "—"} /{" "}
                        {ship.vessel_subtype || "—"}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )
                  ) : ship[key] == null || ship[key] === "" ? (
                    <span className="text-muted-foreground">—</span>
                  ) : key === "imo" ? (
                    <Badge variant="outline">{ship[key]}</Badge>
                  ) : (
                    ship[key]
                  )}
                </TableCell>
              ))}

              <TableCell>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={ship.id == null}
                  aria-label={`${t("viewDetails")}: ${ship.name ?? ship.id}`}
                  nativeButton={false}
                  render={ship.id != null ? <Link {...getDetailsNavigation(ship)} /> : <span />}
                >
                  <Eye aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
