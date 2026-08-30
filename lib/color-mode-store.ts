export type ColorMode = "light" | "dark" | "system";
export type ResolvedMode = "light" | "dark";

export const COLOR_MODE_STORAGE_KEY = "jijel:color-mode";

export type ColorModeSnapshot = {
  mode: ColorMode;
  resolvedMode: ResolvedMode;
};

const listeners = new Set<() => void>();
const serverSnapshot: ColorModeSnapshot = { mode: "system", resolvedMode: "light" };

let currentMode: ColorMode = "system";
let snapshot: ColorModeSnapshot = serverSnapshot;

function darkMediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  return window.matchMedia("(prefers-color-scheme: dark)");
}

function readStoredMode(): ColorMode {
  try {
    const value = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function refreshSnapshot(): void {
  currentMode = readStoredMode();
  const resolvedMode: ResolvedMode =
    currentMode === "system"
      ? darkMediaQuery()?.matches
        ? "dark"
        : "light"
      : currentMode;

  if (snapshot.mode !== currentMode || snapshot.resolvedMode !== resolvedMode) {
    snapshot = { mode: currentMode, resolvedMode };
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function handleExternalChange(): void {
  refreshSnapshot();
  emit();
}
export function subscribeColorMode(onChange: () => void): () => void {
  if (listeners.size === 0) {
    refreshSnapshot();
    window.addEventListener("storage", handleExternalChange);
    darkMediaQuery()?.addEventListener("change", handleExternalChange);
  }
  listeners.add(onChange);

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleExternalChange);
      darkMediaQuery()?.removeEventListener("change", handleExternalChange);
    }
  };
}

export function getColorModeSnapshot(): ColorModeSnapshot {
  refreshSnapshot();
  return snapshot;
}

export function getColorModeServerSnapshot(): ColorModeSnapshot {
  return serverSnapshot;
}

export function setColorMode(next: ColorMode): void {
  try {
    if (next === "system") {
      window.localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
    } else {
      window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
    }
  } catch {
    // يستمر التبديل حتى إن كان التخزين المحلي غير متاح.
  }

  const resolved =
    next === "system"
      ? darkMediaQuery()?.matches
        ? "dark"
        : "light"
      : next;

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
  refreshSnapshot();
  emit();
}
