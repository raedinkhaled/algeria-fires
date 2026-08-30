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
      <header className="sticky top-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="border-b bg-muted/55">
          <div className="mx-auto flex min-h-8 max-w-7xl items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
            <p>تحليل مستقل · المراجعة 4 · بيانات مفتوحة</p>
            <p className="hidden sm:block">
              آخر نافذة رصد: <span className="numeric">22–29.08.2026</span>
            </p>
          </div>
        </div>

        <nav
          aria-label="التنقل الرئيسي"
          className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8"
        >
          <Link
            href={homeSection.href}
            className="flex shrink-0 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <SiteMark size={34} />
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold">حرائق جيجل</span>
              <span className="mt-1 text-xs text-muted-foreground">
                ملف البيانات المفتوحة
              </span>
            </span>
          </Link>

          <div className="me-auto hidden items-center gap-1 lg:flex">
            {siteSections.map((section) => {
              const active = isActive(pathname, section.href);
              return (
                <Button
                  key={section.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                >
                  <Link
                    href={section.href}
                    aria-current={active ? "page" : undefined}
                  >
                    {section.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          <div className="me-auto flex items-center gap-1 lg:me-0">
            <ThemeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
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
                    <SiteMark size={30} />
                    حرائق جيجل
                  </SheetTitle>
                  <SheetDescription>
                    أقسام التحقيق والبيانات والمنهجية
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
                            "flex items-center gap-4 border-b py-4 text-base transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring",
                            active && "text-primary",
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
