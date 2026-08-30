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
        <nav
          aria-label="التنقل الرئيسي"
          className="mx-auto flex min-h-18 max-w-7xl items-stretch gap-4 px-4 sm:px-6 lg:px-8"
        >
          <Link
            href={homeSection.href}
            className="flex shrink-0 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <SiteMark size={32} />
            <span className="flex flex-col gap-1 leading-none">
              <span className="text-sm font-semibold">حرائق جيجل</span>
              <span className="text-xs text-muted-foreground">
                سجل التحقيق المفتوح
              </span>
            </span>
          </Link>

          <div className="me-auto hidden items-stretch lg:flex">
            {siteSections.map((section) => {
              const active = isActive(pathname, section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center border-b-2 border-transparent px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active && "border-foreground font-medium text-foreground",
                  )}
                >
                  {section.label}
                </Link>
              );
            })}
          </div>

          <div className="me-auto flex items-center gap-1 lg:me-0">
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
                  <SheetTitle className="flex items-center gap-3">
                    <SiteMark size={28} />
                    حرائق جيجل
                  </SheetTitle>
                  <SheetDescription>
                    ملف توثيقي مستقل لحرائق أوت 2026
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
        </nav>
      </header>

      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
