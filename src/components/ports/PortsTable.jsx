import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

export default function PortsTable({
  rows,
  columns,
  isPending,
  isError,
  error,
}) {
  const { t, formatNumber, direction } = useLocale();
  const navigate = useNavigate();

  if (isPending) {
    return <p className="p-6 text-sm text-muted-foreground">{t("loadingPorts")}</p>;
  }

  if (isError) {
    return (
      <p className="p-6 text-sm text-destructive">
        {error?.message ?? t("loadPortsError")}
      </p>
    );
  }

  if (!rows.length) {
    return (
      <p className="p-6 text-center text-sm text-muted-foreground">
        {t("noPortsFound")}
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
          <TableHead className="w-16 text-end">Details</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((port) => (
          <TableRow key={port.id}>
            {columns.map(({ key }) => (
              <TableCell
                key={key}
                className={key === "name" ? "font-medium" : undefined}
              >
                {port[key] == null || port[key] === "" ? (
                  <span className="text-muted-foreground">—</span>
                ) : key === "unlo_code" || key === "country_code" ? (
                  <Badge variant="outline">{port[key]}</Badge>
                ) : typeof port[key] === "number" ? (
                  formatNumber(port[key])
                ) : (
                  port[key]
                )}
              </TableCell>
            ))}

            <TableCell className="text-end">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`View details for ${port.name}`}
                title="View port details"
                onClick={() => navigate(`/ports/${port.id}`)}
              >
                <Eye className="size-4" aria-hidden="true" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}