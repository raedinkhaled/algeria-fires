"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type NavigatorItem = { id: string; label: string; index?: string };

/** يرصد القسم الظاهر بين أهداف الفهرس: آخر قسم تجاوز أعلاه ثلث الشاشة. */
export function useCurrentSection(ids: string[]) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!targets.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold = window.innerHeight * 0.35;
      let index = 0;
      targets.forEach((target, position) => {
        if (target.getBoundingClientRect().top <= threshold) index = position;
      });
      setCurrent(index);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ids]);

  return current;
}

/**
 * شريط القسم الحالي تحت الترويسة على الشاشات الضيقة، حيث يختفي الفهرس الجانبي:
 * اسم القسم ورقمه وشرائح تقدّم، ويفتح قائمة الأقسام للقفز إليها.
 */
export function SectionNavigator({
  items,
  heading,
}: {
  items: NavigatorItem[];
  heading: string;
}) {
  const [ids] = useState(() => items.map((item) => item.id));
  const current = useCurrentSection(ids);
  const item = items[current];

  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 text-start focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            aria-label={`${heading}: ${item?.label ?? ""}`}
          >
            <span className="numeric text-[11px] text-signal-ink">
              {item?.index ?? String(current + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">
              {item?.label}
            </span>
            <span className="numeric text-[11px] text-muted-foreground">
              {current + 1}/{items.length}
            </span>
            <ChevronDownIcon aria-hidden="true" className="size-4 text-muted-foreground" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80dvh] gap-0">
          <SheetHeader className="border-b border-rule">
            <SheetTitle>{heading}</SheetTitle>
            <SheetDescription>انتقل مباشرة إلى أي قسم في هذه الصفحة.</SheetDescription>
          </SheetHeader>
          <nav aria-label={heading} className="overflow-y-auto px-4 pb-6">
            <ol>
              {items.map((entry, position) => (
                <li key={entry.id}>
                  <SheetClose asChild>
                    <a
                      href={`#${entry.id}`}
                      aria-current={position === current ? "location" : undefined}
                      className={cn(
                        "flex items-baseline gap-4 border-b border-border py-3.5 text-[15px]",
                        position === current ? "font-medium text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <span className="numeric w-6 text-[11px]">
                        {entry.index ?? String(position + 1).padStart(2, "0")}
                      </span>
                      {entry.label}
                    </a>
                  </SheetClose>
                </li>
              ))}
            </ol>
          </nav>
        </SheetContent>
      </Sheet>
      <div aria-hidden="true" className="flex gap-0.5 pb-2" dir="rtl">
        {items.map((entry, position) => (
          <span
            key={entry.id}
            className={cn(
              "h-0.5 flex-1 transition-colors",
              position < current ? "bg-foreground" : position === current ? "bg-signal" : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
