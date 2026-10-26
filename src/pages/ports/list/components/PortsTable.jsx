import { Eye, Tags } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export default function PortsTable({
  rows = [],
  columns,
  isPending,
  isError,
  error,
}) {
  const { t, formatNumber, direction } = useLocale();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <p className="p-6 text-sm text-muted-foreground">{t("loadingPorts")}</p>
    );
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

  function renderCell(port, key) {
    const value = port[key];

    if (value == null || value === "") {
      return <span className="text-muted-foreground">—</span>;
    }

    if (key === "name") {
      const names = Array.isArray(port.alternative_names)
        ? port.alternative_names
        : [];

      return (
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium" title={value}>
            {value}
          </span>

          {names.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-full text-muted-foreground"
                  aria-label={`Show alternative names for ${port.name}`}
                  title="Alternative names"
                >
                  <Tags className="size-4" aria-hidden="true" />
                </Button>
              </PopoverTrigger>

              <PopoverContent align="start" className="w-56">
                <p className="mb-2 text-sm font-semibold">
                  Alternative names
                </p>
                <ul className="space-y-1">
                  {names.map((name, index) => (
                    <li
                      key={`${name}-${index}`}
                      className="rounded px-2 py-1 text-sm hover:bg-muted"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          )}
        </div>
      );
    }

    if (key === "alternative_names") {
      return Array.isArray(value) ? value.join(", ") : value;
    }

    if (key === "country_name") {
      return <VesselFlag country={value} />;
    }

    if (key === "unlo_code" || key === "country_code") {
      return <Badge variant="outline">{value}</Badge>;
    }

    if (typeof value === "number") {
      return formatNumber(value);
    }

    return value;
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader dir={direction} className="bg-muted/50">
          <TableRow>
            {columns.map(({ key, labelKey }) => (
              <TableHead
                key={key}
                className={key === "name" ? "min-w-56" : undefined}
              >
                {t(labelKey)}
              </TableHead>
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
                  className={key === "name" ? "min-w-56" : undefined}
                >
                  {renderCell(port, key)}
                </TableCell>
              ))}

              <TableCell className="text-end">
                <Button
                  type="button"
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
    </div>
  );
}