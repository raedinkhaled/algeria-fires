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
    <Breadcrumb>
      <BreadcrumbList className="text-[11px]">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">حرائق جيجل</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-border">/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
