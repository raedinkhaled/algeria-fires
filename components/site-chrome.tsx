"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteMark } from "@/components/site-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { homeSection, siteSections } from "@/lib/site-navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-12 max-w-7xl items-stretch px-4 sm:px-6 lg:px-8">
          <Link
            href={homeSection.href}
            className="flex shrink-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <SiteMark size={20} />
            <span className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold tracking-tight">
                حرائق جيجل
              </span>
              <span className="hidden text-[10px] text-muted-foreground sm:block">
                تحقيق حرائق أوت 2026
              </span>
            </span>
          </Link>

          <div
            aria-hidden="true"
            className="mx-5 hidden h-5 w-px shrink-0 self-center bg-border lg:block"
          />

          <nav
            aria-label="التنقل الرئيسي"
            className="me-auto hidden items-stretch lg:flex"
          >
            {siteSections.map((section) => {
              const active = isActive(pathname, section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center border-b-[1.5px] border-transparent px-3.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                    active && "border-foreground text-foreground",
                  )}
                >
                  {section.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-0.5 lg:ms-0">
            <ThemeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="فتح قائمة التنقل"
                >
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm">
                <SheetHeader className="border-b">
                  <SheetTitle className="flex items-center gap-2.5">
                    <SiteMark size={20} />
                    حرائق جيجل
                  </SheetTitle>
                  <SheetDescription>
                    تحقيق مستقل بالبيانات المفتوحة
                  </SheetDescription>
                </SheetHeader>

                <nav aria-label="تنقل الهاتف" className="flex flex-col px-4">
                  {[homeSection, ...siteSections].map((section, index) => {
                    const active = isActive(pathname, section.href);
                    return (
                      <SheetClose key={section.href} asChild>
                        <Link
                          href={section.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-4 border-b py-4 text-base text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
                            active && "font-medium text-foreground",
                          )}
                        >
                          <span className="numeric text-xs text-muted-foreground">
                            {String(index).padStart(2, "0")}
                          </span>
                          <span>{section.label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
