"use client";

import { useMemo, useState } from "react";
import { ExternalLinkIcon, SearchIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  sourceFamilyLabels,
  sourceStatusLabels,
  type SourceFamily,
  type SourceRecord,
  type SourceStatus,
} from "@/lib/source-register";

type FamilyFilter = SourceFamily | "all";
type StatusFilter = SourceStatus | "all";

const familyTone: Record<SourceFamily, string> = {
  DS: "text-info",
  OF: "text-ok",
  MD: "text-support",
  ME: "text-warn",
};

const statusTone: Record<SourceStatus, string> = {
  available: "text-ok",
  bibliographic: "text-warn",
  excluded: "text-destructive",
};

export function SourceRegister({ records }: { records: SourceRecord[] }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<FamilyFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ar");
    return records.filter((record) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          record.id,
          record.title,
          record.publisher,
          record.detail,
          record.date,
        ]
          .join(" ")
          .toLocaleLowerCase("ar")
          .includes(normalizedQuery);
      const matchesFamily = family === "all" || record.family === family;
      const matchesStatus = status === "all" || record.status === status;
      return matchesQuery && matchesFamily && matchesStatus;
    });
  }, [family, query, records, status]);

  return (
    <div className="source-register border-t border-rule">
      <div className="grid gap-4 border-b border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <Field>
          <FieldLabel htmlFor="source-search">ابحث في السجل</FieldLabel>
          <div className="relative">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="source-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="المعرّف أو الناشر أو موضوع المصدر"
              className="h-10 bg-background ps-9"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="source-family">فئة المصدر</FieldLabel>
          <Select
            value={family}
            onValueChange={(value) => setFamily(value as FamilyFilter)}
          >
            <SelectTrigger id="source-family" className="w-full bg-background data-[size=default]:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">كل الفئات</SelectItem>
                {Object.entries(sourceFamilyLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="source-status">حالة المصدر</FieldLabel>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger id="source-status" className="w-full bg-background data-[size=default]:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">كل الحالات</SelectItem>
                {Object.entries(sourceStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div
        aria-live="polite"
        className="flex h-10 items-center justify-between border-b border-border px-1 text-[11.5px] text-muted-foreground"
      >
        <span>السجلات المطابقة</span>
        <span className="numeric">{filtered.length} / {records.length}</span>
      </div>

      {filtered.length ? (
        <Table className="source-register-table min-w-[880px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">المعرّف</TableHead>
              <TableHead className="w-36">الفئة</TableHead>
              <TableHead>المصدر واستعماله</TableHead>
              <TableHead className="w-36">الحالة</TableHead>
              <TableHead className="w-24">الرابط</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="align-top">
                  <span className={cn("ltr-embed font-medium", familyTone[record.family])}>
                    {record.id}
                  </span>
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  <span className={cn("text-xs font-medium", familyTone[record.family])}>
                    {sourceFamilyLabels[record.family]}
                  </span>
                </TableCell>
                <TableCell className="align-top whitespace-normal py-3">
                  <p className="font-medium leading-6" dir="auto">
                    {record.title}
                  </p>
                  <p
                    className="mt-1 text-xs leading-6 text-muted-foreground"
                    dir="auto"
                  >
                    {record.publisher}
                    {record.date ? `، ${record.date}` : ""}
                  </p>
                  {record.detail ? (
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">
                      {record.detail}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="align-top whitespace-normal py-3">
                  <span className={cn("text-xs font-medium", statusTone[record.status])}>
                    {sourceStatusLabels[record.status]}
                  </span>
                </TableCell>
                <TableCell className="align-top py-3">
                  {record.urls.length ? (
                    <div className="flex flex-col items-start gap-2">
                      {record.urls.map((url, index) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-xs underline decoration-border underline-offset-4 hover:decoration-foreground"
                          aria-label={`فتح رابط ${record.id}${record.urls.length > 1 ? ` رقم ${index + 1}` : ""}`}
                        >
                          فتح
                          <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">لا رابط</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Empty className="min-h-56 rounded-none">
          <EmptyHeader>
            <EmptyTitle>لا توجد سجلات مطابقة</EmptyTitle>
            <EmptyDescription>
              جرّب عبارة أعم أو أعد مرشّح الفئة والحالة إلى «الكل».
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
