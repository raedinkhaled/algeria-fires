"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@astryxdesign/core/AppShell";
import { VStack, StackItem } from "@astryxdesign/core/Stack";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";

import { SiteMark } from "@/components/site-mark";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { homeSection, siteSections } from "@/lib/site-navigation";

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <VStack gap={0} minHeight="100dvh">
      <StackItem size="fill">
        <AppShell
          height="auto"
          variant="section"
          contentPadding={0}
          topNav={
            <TopNav
              label="التنقل الرئيسي"
              heading={
                <TopNavHeading
                  logo={<SiteMark size={30} />}
                  heading="حرائق جيجل"
                  headingHref={homeSection.href}
                  subheading="إعادة بناء بالبيانات المفتوحة"
                />
              }
              startContent={
                <>
                  {siteSections.map((section) => (
                    <TopNavItem
                      key={section.href}
                      label={section.label}
                      href={section.href}
                      isSelected={isActive(pathname, section.href)}
                    />
                  ))}
                </>
              }
              endContent={<ThemeToggle />}
            />
          }
        >
          {children}
        </AppShell>
      </StackItem>
      <SiteFooter />
    </VStack>
  );
}
