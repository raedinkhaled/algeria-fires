import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function StoryBreadcrumb({ current }: { current: string }) {
  return (
    <Breadcrumb aria-label="مسار الصفحة">
      <BreadcrumbList className="text-[11.5px]">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">حرائق جيجل</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-muted-foreground">/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
