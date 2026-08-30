"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";

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
  mode: ColorMode;
  resolvedMode: ResolvedMode;
  toggle: () => void;
  setMode: (mode: ColorMode) => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export function useColorMode(): ColorModeContextValue {
  const value = useContext(ColorModeContext);
  if (!value) {
    throw new Error("useColorMode يجب أن يُستخدم داخل <Providers>");
  }
  return value;
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
    <ColorModeContext.Provider value={contextValue}>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </MotionConfig>
    </ColorModeContext.Provider>
  );
}

export const colorModeScript = `(function(){try{var m=localStorage.getItem("${COLOR_MODE_STORAGE_KEY}");var d=m==="dark"||(m!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
