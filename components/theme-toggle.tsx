"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { IconButton } from "@astryxdesign/core/IconButton";

import { useColorMode } from "@/components/providers";

const noopSubscribe = () => () => {};

/** false أثناء الترطيب، ثم true — نمط قياسي بلا useEffect. */
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

  // قبل الترطيب لا نعرف الوضع الفعلي؛ نُظهر أيقونة محايدة كي لا يختلف الخادم.
  if (!hydrated) {
    return (
      <IconButton
        variant="ghost"
        size="sm"
        label="بدّل بين الوضع الفاتح والداكن"
        icon={<SunMoon size={18} aria-hidden="true" />}
      />
    );
  }

  const goingDark = resolvedMode === "light";
  return (
    <IconButton
      variant="ghost"
      size="sm"
      label={goingDark ? "التحويل إلى الوضع الداكن" : "التحويل إلى الوضع الفاتح"}
      tooltip={goingDark ? "الوضع الداكن" : "الوضع الفاتح"}
      onClick={toggle}
      icon={
        goingDark ? (
          <Moon size={18} aria-hidden="true" />
        ) : (
          <Sun size={18} aria-hidden="true" />
        )
      }
    />
  );
}
