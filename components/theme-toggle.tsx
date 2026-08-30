"use client";

import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { useColorMode } from "@/components/providers";
import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};

function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
export function ThemeToggle() {
  const { resolvedMode, toggle } = useColorMode();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="بدّل بين الوضع الفاتح والداكن"
        title="تبديل السمة"
      >
        <SunMoonIcon />
      </Button>
    );
  }

  const goingDark = resolvedMode === "light";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={goingDark ? "التحويل إلى الوضع الداكن" : "التحويل إلى الوضع الفاتح"}
      title={goingDark ? "الوضع الداكن" : "الوضع الفاتح"}
      onClick={toggle}
    >
      {goingDark ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}
