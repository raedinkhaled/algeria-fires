/**
 * مخزن وضع اللون خارج React: يقرأ الاختيار من localStorage ويتابع تفضيل
 * النظام، ويُستهلك عبر useSyncExternalStore فلا حاجة إلى useEffect/useState
 * لمزامنة حالة خارجية.
 *
 * السكربت المضمّن في <body> يضبط data-theme قبل أول رسم؛ هنا نُبقيه متوافقاً
 * عند كل تبديل، ونمرّر mode إلى <Theme>.
 */

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
let systemPrefersDark = false;
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

/** يعيد الحساب ويحدّث اللقطة بمرجع ثابت ما لم تتغيّر القيمة. */
function refreshSnapshot(): void {
  currentMode = readStoredMode();
  systemPrefersDark = darkMediaQuery()?.matches ?? false;
  const resolvedMode: ResolvedMode =
    currentMode === "system" ? (systemPrefersDark ? "dark" : "light") : currentMode;

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

/** يحفظ الاختيار، ويعكسه فوراً على <html data-theme>، ثم يُخطر المشتركين. */
export function setColorMode(next: ColorMode): void {
  try {
    if (next === "system") {
      window.localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
    } else {
      window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
    }
  } catch {
    /* التخزين غير متاح */
  }

  try {
    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
  } catch {
    /* لا DOM */
  }

  refreshSnapshot();
  emit();
}
