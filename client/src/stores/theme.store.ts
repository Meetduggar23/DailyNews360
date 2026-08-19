import { create } from "zustand";
import { LOCAL_STORAGE_KEYS } from "@/constants";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  init: () => void;
}

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.theme);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches === true
  );
}

function applyTheme(resolved: "light" | "dark"): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#0B0D10" : "#C62828");
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  resolved: "light",

  init: () => {
    const mode = readStoredMode();
    const resolved = mode === "system" ? (systemPrefersDark() ? "dark" : "light") : mode;
    applyTheme(resolved);
    set({ mode, resolved });
  },

  setMode: (mode) => {
    const resolved = mode === "system" ? (systemPrefersDark() ? "dark" : "light") : mode;
    localStorage.setItem(LOCAL_STORAGE_KEYS.theme, mode);
    applyTheme(resolved);
    set({ mode, resolved });
  },

  toggle: () => {
    const next: ThemeMode = get().resolved === "dark" ? "light" : "dark";
    get().setMode(next);
  },
}));

// React to OS scheme changes while in "system" mode.
if (typeof window !== "undefined" && window.matchMedia) {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      const state = useThemeStore.getState();
      if (state.mode === "system") {
        const resolved: "light" | "dark" = event.matches ? "dark" : "light";
        applyTheme(resolved);
        setResolved(resolved);
      }
    });
}

function setResolved(resolved: "light" | "dark"): void {
  useThemeStore.setState({ resolved });
}