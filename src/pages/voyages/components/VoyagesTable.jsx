import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/context/LocaleContext";
import { formatTimestamp } from "@/lib/dateTime";

export default function VoyagesTable({
  rows,
  displayedColumns,
  isPending,
  isError,
  error,
  showDetails,
}) {
  const { t, direction } = useLocale();

  return (
    <Card className="py-0">
      {isPending ? (
        <p className="p-6 text-sm text-muted-foreground">
          {t("loadingVoyages")}
        </p>
      ) : isError ? (
        <p className="p-6 text-sm text-destructive">
          {error?.message ?? t("loadVoyagesError")}
        </p>
      ) : rows.length ? (
        <Table>
          <TableHeader dir={direction} className="bg-muted/50">
            <TableRow>
              {displayedColumns.map((column) => (
                <TableHead key={column.key}>
                  {column.labelKey ? t(column.labelKey) : column.label}
                </TableHead>
              ))}
              <TableHead>{t("viewDetails")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((voyage) => (
              <TableRow key={voyage.id}>
                {displayedColumns.map(({ key }) => {
                  const value = voyage[key];
                  const displayValue =
                    key === "departure_time" || key === "arrival_time"
                      ? formatTimestamp(value)
                      : value;

                  return (
                    <TableCell key={key}>
                      {displayValue == null || displayValue === "" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : key === "ship_id" ? (
                        <Badge variant="outline">{displayValue}</Badge>
                      ) : typeof displayValue === "number" ? (
                        displayValue
                      ) : (
                        displayValue
                      )}
                    </TableCell>
                  );
                })}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={voyage.ship_id == null}
                    aria-label={`${t("viewDetails")}: ${
                      voyage.name ?? voyage.ship_id
                    }`}
                    onClick={() => showDetails(voyage)}
                  >
                    <Eye aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="p-6 text-center text-sm text-muted-foreground">
          {t("noVoyagesFound")}
        </p>
      )}
    </Card>
  );
}
