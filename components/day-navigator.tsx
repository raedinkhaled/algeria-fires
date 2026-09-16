"use client";

import { useState } from "react";

import { useCurrentSection } from "@/components/section-navigator";
import { cn } from "@/lib/utils";

export type NavigatorDay = {
  id: string;
  day: string;
  headline: string;
  detections: number;
};

/**
 * شريط الأيام اللاصق فوق صفوف التسلسل: رقم كل يوم وعمود رصده، واليوم الظاهر
 * بالجمري. يبقى رابطاً عادياً إلى مرساة اليوم.
 */
export function DayNavigator({ days }: { days: NavigatorDay[] }) {
  const [ids] = useState(() => days.map((day) => day.id));
  const current = useCurrentSection(ids);
  const max = Math.max(1, ...days.map((day) => day.detections));

  return (
    <nav
      aria-label="التنقل بين الأيام"
      className="sticky top-[123px] z-20 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-16 lg:mx-0 lg:px-0"
    >
      <ol className="grid grid-cols-8">
        {days.map((day, index) => {
          const active = index === current;
          return (
            <li key={day.id}>
              <a
                href={`#${day.id}`}
                aria-current={active ? "location" : undefined}
                title={day.headline}
                className="group flex h-16 flex-col justify-end gap-1 px-1 pb-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <span className="flex h-5 items-end" dir="ltr">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "w-full transition-colors",
                      active ? "bg-signal" : "bg-foreground/20 group-hover:bg-foreground/40",
                    )}
                    style={{ height: `${Math.max(8, (day.detections / max) * 100)}%` }}
                  />
                </span>
                <span
                  className={cn(
                    "numeric text-[12px] leading-4",
                    active ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {day.day}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
