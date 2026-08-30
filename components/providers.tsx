"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import NextLink from "next/link";
import { Theme } from "@astryxdesign/core/theme";
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { LinkProvider } from "@astryxdesign/core/Link";

import { jijelTheme } from "@/themes/jijel";
import { astryxArabicOverrides } from "@/lib/astryx-ar";
import {
  COLOR_MODE_STORAGE_KEY,
  getColorModeServerSnapshot,
  getColorModeSnapshot,
  setColorMode,
  subscribeColorMode,
  type ColorMode,
  type ResolvedMode,
} from "@/lib/color-mode-store";

type ColorModeContextValue = {
  /** الاختيار المخزَّن: فاتح أو داكن أو اتّباع النظام. */
  mode: ColorMode;
  /** الوضع الظاهر فعلاً بعد حسم "النظام" على العميل. */
  resolvedMode: ResolvedMode;
  /** يبدّل بين الفاتح والداكن ويحفظ الاختيار محلياً. */
  toggle: () => void;
  setMode: (mode: ColorMode) => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode يجب أن يُستخدم داخل <Providers>");
  }
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  const { mode, resolvedMode } = useSyncExternalStore(
    subscribeColorMode,
    getColorModeSnapshot,
    getColorModeServerSnapshot,
  );

  const toggle = useCallback(() => {
    setColorMode(resolvedMode === "dark" ? "light" : "dark");
  }, [resolvedMode]);

  const contextValue = useMemo<ColorModeContextValue>(
    () => ({ mode, resolvedMode, toggle, setMode: setColorMode }),
    [mode, resolvedMode, toggle],
  );

  return (
    <InternationalizationProvider
      locale="ar-DZ"
      dir="rtl"
      overrides={{ "ar-DZ": astryxArabicOverrides }}
    >
      <Theme theme={jijelTheme} mode={mode}>
        <LinkProvider component={NextLink}>
          <ColorModeContext.Provider value={contextValue}>
            {children}
          </ColorModeContext.Provider>
        </LinkProvider>
      </Theme>
    </InternationalizationProvider>
  );
}

/**
 * سكربت يسبق أول رسم: يضبط data-theme من التخزين المحلي فيمنع وميض الوضع.
 * يُحقن كما هو في <body> قبل شجرة React.
 */
export const colorModeScript = `(function(){try{var m=localStorage.getItem("${COLOR_MODE_STORAGE_KEY}");if(m==="light"||m==="dark"){document.documentElement.setAttribute("data-theme",m);}}catch(e){}})();`;
