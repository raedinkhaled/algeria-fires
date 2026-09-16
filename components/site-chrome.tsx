"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { ChapterTracking } from "@/components/chapter-tracking";
import { ReadingProgress } from "@/components/motion";
import { CondolenceDialog } from "@/components/condolence-dialog";
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
import { homeSection, sectionIndex, siteSections } from "@/lib/site-navigation";
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
      <a href="#main-content" className="skip-link">
        انتقل إلى المحتوى
      </a>
      <ReadingProgress />
      <ChapterTracking />
      <CondolenceDialog />
      <header className="site-header sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-stretch px-4 sm:px-6 lg:px-8">
          <Link
            href={homeSection.href}
            aria-current={isActive(pathname, homeSection.href) ? "page" : undefined}
            className="flex shrink-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <SiteMark size={28} />
            <span className="flex flex-col">
              <span className="text-[16px] font-semibold leading-6">حرائق جيجل</span>
              <span className="hidden text-[10.5px] leading-4 text-muted-foreground sm:block">
                تحقيق حرائق أوت 2026
              </span>
            </span>
          </Link>

          <nav
            aria-label="التنقل الرئيسي"
            className="ms-8 hidden items-stretch lg:flex xl:ms-12"
          >
            {siteSections.map((section) => {
              const active = isActive(pathname, section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 px-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring xl:px-3.5",
                    "after:absolute after:inset-x-2.5 after:-bottom-px after:h-0.5 after:bg-signal after:opacity-0 after:transition-opacity xl:after:inset-x-3.5",
                    active && "text-foreground after:opacity-100",
                  )}
                >
                  <span className="numeric hidden text-[10px] text-muted-foreground xl:inline">
                    {sectionIndex(section.href)}
                  </span>
                  {section.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-1">
            <span className="numeric me-3 hidden text-[10.5px] text-muted-foreground 2xl:inline">
              36.72°N · 5.95°E
            </span>
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
              <SheetContent side="right" className="w-full gap-0 sm:max-w-sm">
                <SheetHeader className="border-b border-rule">
                  <SheetTitle className="flex items-center gap-3 text-lg">
                    <SiteMark size={28} />
                    حرائق جيجل
                  </SheetTitle>
                  <SheetDescription>تحقيق مستقل بالبيانات المفتوحة</SheetDescription>
                </SheetHeader>

                <nav aria-label="تنقل الهاتف" className="flex flex-col overflow-y-auto px-4">
                  {[homeSection, ...siteSections].map((section, index) => {
                    const active = isActive(pathname, section.href);
                    return (
                      <SheetClose key={section.href} asChild>
                        <Link
                          href={section.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-4 border-b border-border py-4 text-[17px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
                            active && "font-medium text-foreground",
                          )}
                        >
                          <span className="numeric w-6 text-xs text-muted-foreground">
                            {String(index).padStart(2, "0")}
                          </span>
                          <span>{section.label}</span>
                          {active ? (
                            <span aria-hidden="true" className="ms-auto size-1.5 bg-signal" />
                          ) : null}
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

      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
