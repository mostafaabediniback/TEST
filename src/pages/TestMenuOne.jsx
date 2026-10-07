import { useState } from "react";
import { ChevronLeft, ChevronRight, Columns3, Search, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocale } from "@/context/LocaleContext";
import { useSearch } from "@/context/SearchContext";

const users = [
  { id: 1, name: { fa: "علی محمدی", en: "Ali Mohammadi" }, email: "ali@example.com", role: "Administrator", status: "Active", joined: "2026-09-01" },
  { id: 2, name: { fa: "سارا احمدی", en: "Sara Ahmadi" }, email: "sara@example.com", role: "Operator", status: "Active", joined: "2026-09-05" },
  { id: 3, name: { fa: "رضا کریمی", en: "Reza Karimi" }, email: "reza@example.com", role: "Member", status: "Pending", joined: "2026-09-10" },
  { id: 4, name: { fa: "مریم رضایی", en: "Maryam Rezaei" }, email: "maryam@example.com", role: "Operator", status: "Active", joined: "2026-09-15" },
  { id: 5, name: { fa: "امیر حسینی", en: "Amir Hosseini" }, email: "amir@example.com", role: "Member", status: "Inactive", joined: "2026-09-20" },
  { id: 6, name: { fa: "نگار موسوی", en: "Negar Mousavi" }, email: "negar@example.com", role: "Member", status: "Pending", joined: "2026-10-01" },
];

const statuses = ["All users", "Active", "Pending", "Inactive"];
const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "joined", label: "Join date" },
];
const statusStyles = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Inactive: "border-border bg-muted text-muted-foreground",
};

function StatusBadge({ status, t }) {
  return <Badge variant="outline" className={statusStyles[status]}>{t(status)}</Badge>;
}

export default function TestMenuOne() {
  const { locale, direction, t, formatNumber } = useLocale();
  const { debouncedSearch } = useSearch();
  const [status, setStatus] = useState("All users");
  const [filter, setFilter] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [pagination, setPagination] = useState({ key: "", page: 1 });
  const [visibleColumns, setVisibleColumns] = useState(columns.map((column) => column.key));
  const search = debouncedSearch.trim().toLocaleLowerCase();
  const localSearch = filter.trim().toLocaleLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesStatus = status === "All users" || user.status === status;
    const text = [user.name.fa, user.name.en, user.email, t(user.role), t(user.status)].join(" ").toLocaleLowerCase();
    return matchesStatus && text.includes(search) && text.includes(localSearch);
  });
  // A new filter starts at page one, including the shared header search.
  const paginationKey = JSON.stringify([search, localSearch, status, pageSize, locale]);
  if (pagination.key !== paginationKey) {
    setPagination({ key: paginationKey, page: 1 });
  }
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const page = pagination.key === paginationKey ? Math.min(pagination.page, pageCount) : 1;
  const setPage = (nextPage) => setPagination({ key: paginationKey, page: nextPage });
  const start = (page - 1) * pageSize;
  const pageUsers = filteredUsers.slice(start, start + pageSize);
  const displayedColumns = columns.filter((column) => visibleColumns.includes(column.key));
  const toggleColumn = (key, checked) => setVisibleColumns((current) => checked
    ? [...current, key]
    : current.filter((column) => column !== key));
  const formatDate = (value) => new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
    dateStyle: "medium", timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));

  return (
    <section className="h-full overflow-y-auto bg-muted/30 p-4 sm:p-6" aria-labelledby="users-title">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background text-primary">
            <Users className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">{t("Test menu 1")}</p>
            <h2 id="users-title" className="text-xl font-semibold">{t("User directory")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("Sample users. Search by name, email, or role.")}</p>
          </div>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder={t("Filter users by name, email, or role...")}
              aria-label={t("Filter users")}
              className="h-10 bg-background ps-10 pe-10 [&::-webkit-search-cancel-button]:hidden"
            />
            {filter && <Button variant="ghost" size="icon-sm" aria-label={t("Clear filter")} className="absolute end-1.5 top-1/2 -translate-y-1/2" onClick={() => setFilter("")}><X aria-hidden="true" /></Button>}
          </div>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" className="h-10" />}>
              <Columns3 aria-hidden="true" />
              {t("Columns")} ({formatNumber(displayedColumns.length)}/{formatNumber(columns.length)})
            </PopoverTrigger>
            <PopoverContent align="end" dir={direction} className="w-64 max-w-[calc(100vw-2rem)] text-start">
              <PopoverTitle>{t("Visible columns")}</PopoverTitle>
              <PopoverDescription>{t("Choose fields shown in the table and cards.")}</PopoverDescription>
              <div className="space-y-1">
                {columns.map((column) => (
                  <label key={column.key} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted">
                    <input type="checkbox" checked={visibleColumns.includes(column.key)} disabled={column.key === "name"} onChange={(event) => toggleColumn(column.key, event.target.checked)} className="size-4 accent-primary disabled:cursor-not-allowed" />
                    <span>{t(column.label)}</span>
                    {column.key === "name" && <span className="ms-auto text-xs text-muted-foreground">{t("Required")}</span>}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("Filter by status")}>
            {statuses.map((item) => (
              <Button key={item} variant={status === item ? "default" : "outline"} size="sm" aria-pressed={status === item} onClick={() => setStatus(item)}>
                {t(item)}
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground" role="status">{t("{count} of {total} users", { count: formatNumber(filteredUsers.length), total: formatNumber(users.length) })}</span>
        </div>

        {filteredUsers.length ? (
          <>
            <Card className="hidden py-0 md:block">
              <Table>
                <TableCaption className="sr-only">{t("User directory")}</TableCaption>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    {displayedColumns.map((column) => <TableHead key={column.key} scope="col">{t(column.label)}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name[locale]}</TableCell>
                      {visibleColumns.includes("email") && <TableCell><span dir="ltr" className="inline-block text-muted-foreground">{user.email}</span></TableCell>}
                      {visibleColumns.includes("role") && <TableCell>{t(user.role)}</TableCell>}
                      {visibleColumns.includes("status") && <TableCell><StatusBadge status={user.status} t={t} /></TableCell>}
                      {visibleColumns.includes("joined") && <TableCell className="text-muted-foreground">{formatDate(user.joined)}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <ul className="grid gap-3 sm:grid-cols-2 md:hidden" aria-label={t("User directory")}>
              {pageUsers.map((user) => (
                <li key={user.id} className="min-w-0">
                  <Card className="h-full">
                    <CardHeader className={`flex flex-row items-center justify-between gap-2 ${visibleColumns.some((key) => !["name", "status"].includes(key)) ? "border-b" : ""}`}>
                      <h3 className="font-semibold">{user.name[locale]}</h3>
                      {visibleColumns.includes("status") && <StatusBadge status={user.status} t={t} />}
                    </CardHeader>
                    {visibleColumns.some((key) => !["name", "status"].includes(key)) && <CardContent>
                      <dl className="space-y-3 text-sm">
                        {visibleColumns.includes("email") && <div><dt className="mb-1 text-xs text-muted-foreground">{t("Email")}</dt><dd dir="ltr" className="break-all text-start">{user.email}</dd></div>}
                        {visibleColumns.includes("role") && <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{t("Role")}</dt><dd>{t(user.role)}</dd></div>}
                        {visibleColumns.includes("joined") && <div className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{t("Join date")}</dt><dd>{formatDate(user.joined)}</dd></div>}
                      </dl>
                    </CardContent>}
                  </Card>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Card><CardContent className="py-10 text-center">
            <Users className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">{t("No users found")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("Try another search or status filter.")}</p>
          </CardContent></Card>
        )}

        <footer className="flex flex-col gap-4 rounded-xl border bg-background p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="users-page-size" className="text-xs text-muted-foreground">{t("Rows per page")}</label>
            <select id="users-page-size" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {[5, 10, 20].map((size) => <option key={size} value={size}>{formatNumber(size)}</option>)}
            </select>
            <span className="text-xs text-muted-foreground" role="status">{t("Showing {from}–{to} of {total}", { from: formatNumber(filteredUsers.length ? start + 1 : 0), to: formatNumber(Math.min(start + pageSize, filteredUsers.length)), total: formatNumber(filteredUsers.length) })}</span>
          </div>
          <nav aria-label={t("Pagination")} className="flex flex-wrap items-center gap-1">
            <Button variant="outline" size="sm" disabled={page === 1 || !filteredUsers.length} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="rtl:rotate-180" aria-hidden="true" />{t("Previous")}
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <Button key={number} variant={number === page ? "default" : "outline"} size="icon-sm" aria-label={t("Page {number}", { number: formatNumber(number) })} aria-current={number === page ? "page" : undefined} disabled={!filteredUsers.length} onClick={() => setPage(number)}>{formatNumber(number)}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={page === pageCount || !filteredUsers.length} onClick={() => setPage(page + 1)}>
              {t("Next")}<ChevronRight className="rtl:rotate-180" aria-hidden="true" />
            </Button>
          </nav>
        </footer>
      </div>
    </section>
  );
}
