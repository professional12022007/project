/**
 * BenefitOS Design System — single source of truth for all colors and spacing.
 *
 * Two palettes: dark and light. The theme store selects which one is active.
 * Screens import `Palette` (the active palette) directly for inline styles.
 * `Colors` is exported for use-theme.ts compatibility (Colors[scheme]).
 */

// ---------------------------------------------------------------------------
// Dark palette
// ---------------------------------------------------------------------------
const DarkPalette = {
  // Backgrounds
  background: '#0F0F1A',
  surface: '#16162A',
  border: '#252545',

  // Primary accent
  primary: '#5B54D6',
  primaryA12: '#5B54D612',
  primaryA14: '#5B54D614',
  primaryA18: '#5B54D618',
  primaryA22: '#5B54D622',
  primaryA33: '#5B54D633',
  primaryA44: '#5B54D644',
  primaryA55: '#5B54D655',

  // Secondary accent — muted teal
  secondary: '#3D9DB8',
  secondaryA0D: '#3D9DB80D',
  secondaryA22: '#3D9DB822',
  secondaryA44: '#3D9DB844',
  secondaryA66: '#3D9DB866',

  // Success — muted green
  success: '#3FA66B',
  successA18: '#3FA66B18',
  successA33: '#3FA66B33',

  // Error — muted rose
  error: '#D6566E',
  errorA15: '#D6566E15',
  errorA18: '#D6566E18',
  errorA20: '#D6566E20',
  errorA40: '#D6566E40',
  errorA44: '#D6566E44',

  // Text
  textPrimary: '#EDEDF5',
  textSecondary: '#9999BB',
  textMuted: '#555577',

  // Absolute
  white: '#FFFFFF',
  black: '#000000',

  // Functional
  recordingRed: '#D94040',
  amber: '#F59E0B',
} as const;

// ---------------------------------------------------------------------------
// Light palette — government-grade professional light theme
// ---------------------------------------------------------------------------
const LightPalette = {
  // Backgrounds
  background: '#F5F6FA',
  surface: '#FFFFFF',
  border: '#E2E4EC',

  // Primary accent — deep government blue
  primary: '#1A4D8F',
  primaryA12: '#1A4D8F12',
  primaryA14: '#1A4D8F14',
  primaryA18: '#1A4D8F18',
  primaryA22: '#1A4D8F22',
  primaryA33: '#1A4D8F33',
  primaryA44: '#1A4D8F44',
  primaryA55: '#1A4D8F55',

  // Secondary accent — teal
  secondary: '#0E7A6B',
  secondaryA0D: '#0E7A6B0D',
  secondaryA22: '#0E7A6B22',
  secondaryA44: '#0E7A6B44',
  secondaryA66: '#0E7A6B66',

  // Success — green
  success: '#2D8659',
  successA18: '#2D865918',
  successA33: '#2D865933',

  // Error — red
  error: '#C53C3C',
  errorA15: '#C53C3C15',
  errorA18: '#C53C3C18',
  errorA20: '#C53C3C20',
  errorA40: '#C53C3C40',
  errorA44: '#C53C3C44',

  // Text
  textPrimary: '#1A1D2E',
  textSecondary: '#5A5F73',
  textMuted: '#9095A8',

  // Absolute
  white: '#FFFFFF',
  black: '#000000',

  // Functional
  recordingRed: '#C53C3C',
  amber: '#D97706',
} as const;

export type PaletteType = typeof DarkPalette;

// ---------------------------------------------------------------------------
// Active palette — mutated by the theme store
// ---------------------------------------------------------------------------
export let Palette: PaletteType = DarkPalette;

export function setPalette(p: PaletteType) {
  Palette = p;
}

export function getDarkPalette() {
  return DarkPalette;
}

export function getLightPalette() {
  return LightPalette;
}

// ---------------------------------------------------------------------------
// Spacing scale  (4 8 12 16 24 32)
// ---------------------------------------------------------------------------
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// ---------------------------------------------------------------------------
// Colors — used by use-theme.ts (Colors[scheme])
// ---------------------------------------------------------------------------
export const Colors = {
  dark: DarkPalette,
  light: LightPalette,
} as const;
