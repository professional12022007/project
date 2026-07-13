/**
 * BenefitOS Design System — single source of truth for all colors and spacing.
 *
 * Two palettes: dark and light. The theme store selects which one is active.
 * Screens use `useThemedStyles` hook for reactive styles, or `useThemeStore`
 * for inline palette access.
 */

// ---------------------------------------------------------------------------
// Dark palette — premium government-grade dark theme
// Inspired by Passport Seva, DigiLocker, UMANG
// ---------------------------------------------------------------------------
const DarkPalette = {
  // Backgrounds
  background: '#0B1220',
  surface: '#111827',
  border: '#273449',

  // Primary accent — government blue
  primary: '#2563EB',
  primaryA12: '#2563EB12',
  primaryA14: '#2563EB14',
  primaryA18: '#2563EB18',
  primaryA22: '#2563EB22',
  primaryA33: '#2563EB33',
  primaryA44: '#2563EB44',
  primaryA55: '#2563EB55',

  // Secondary accent — cyan
  secondary: '#06B6D4',
  secondaryA0D: '#06B6D40D',
  secondaryA22: '#06B6D422',
  secondaryA44: '#06B6D444',
  secondaryA66: '#06B6D466',

  // Success — green
  success: '#16A34A',
  successA18: '#16A34A18',
  successA33: '#16A34A33',

  // Error — red
  error: '#DC2626',
  errorA15: '#DC262615',
  errorA18: '#DC262618',
  errorA20: '#DC262620',
  errorA40: '#DC262640',
  errorA44: '#DC262644',

  // Warning
  warning: '#D97706',
  warningA18: '#D9770618',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',

  // Absolute
  white: '#FFFFFF',
  black: '#000000',

  // Functional
  recordingRed: '#DC2626',
  amber: '#D97706',
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

  // Warning
  warning: '#D97706',
  warningA18: '#D9770618',

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
