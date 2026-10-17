import { Eye } from "lucide-react";
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

export default function ShipsTable({
  rows,
  columns,
  isPending,
  isError,
  error,
  onViewDetails,
}) {
  const { t, direction } = useLocale();

  if (isPending) {
    return (
      <p className="p-6 text-sm text-muted-foreground">{t("loadingShips")}</p>
    );
  }

  if (isError) {
    return (
      <p className="p-6 text-sm text-destructive">
        {error?.message ?? t("loadShipsError")}
      </p>
    );
  }

  if (!rows.length) {
    return (
      <p className="p-6 text-center text-sm text-muted-foreground">
        {t("noShipsFound")}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader dir={direction} className="bg-muted/50">
        <TableRow>
          {columns.map(({ key, labelKey }) => (
            <TableHead key={key}>{t(labelKey)}</TableHead>
          ))}
          <TableHead>{t("viewDetails")}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((ship) => (
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
                onClick={() => onViewDetails(ship)}
              >
                <Eye aria-hidden="true" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
