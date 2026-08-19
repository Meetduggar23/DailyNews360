export type LensShape = "circle" | "rectangle";
export type LensSize = "small" | "medium" | "large" | "xl";
export type TextSize = "small" | "normal" | "large" | "xl";
export type ReadingTheme = "normal" | "sepia" | "high-contrast" | "dark";

export interface ReadingLensState {
  active: boolean;
  zoom: number;
  lensSize: LensSize;
  lensShape: LensShape;
  textSize: TextSize;
  readingMode: boolean;
  focusLine: boolean;
  readingRuler: boolean;
  highContrast: boolean;
  readingTheme: ReadingTheme;
}

export const ZOOM_LEVELS = [100, 125, 150, 175, 200, 250, 300] as const;
export const DEFAULT_ZOOM = 150;

export const LENS_SIZE_MAP: Record<LensSize, number> = {
  small: 180,
  medium: 240,
  large: 300,
  xl: 360,
};

export const TEXT_SIZE_MAP: Record<TextSize, string> = {
  small: "0.875rem",
  normal: "1rem",
  large: "1.125rem",
  xl: "1.375rem",
};

export const LINE_HEIGHT_MAP: Record<TextSize, string> = {
  small: "1.5",
  normal: "1.75",
  large: "1.85",
  xl: "2",
};

export const DEFAULT_STATE: ReadingLensState = {
  active: false,
  zoom: DEFAULT_ZOOM,
  lensSize: "medium",
  lensShape: "circle",
  textSize: "normal",
  readingMode: false,
  focusLine: false,
  readingRuler: false,
  highContrast: false,
  readingTheme: "normal",
};

const STORAGE_KEY = "dn360:reading-lens";

export function loadReadingLensState(): Partial<ReadingLensState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<ReadingLensState>;
    return { ...parsed, active: false }; // never restore active state
  } catch {
    return {};
  }
}

export function saveReadingLensState(state: ReadingLensState): void {
  try {
    const toSave = { ...state, active: false };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // silently fail
  }
}

export function resetReadingLensState(): ReadingLensState {
  return { ...DEFAULT_STATE };
}
