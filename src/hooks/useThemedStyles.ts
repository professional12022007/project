import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { getDarkPalette, getLightPalette, type PaletteType } from '@/constants/theme';

/**
 * Re-evaluates a StyleSheet.create() factory whenever the theme mode changes.
 * Solves the problem of static StyleSheet.create capturing stale palette values.
 *
 * Usage:
 *   const s = useThemedStyles((p) => StyleSheet.create({
 *     container: { backgroundColor: p.background },
 *   }));
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (palette: PaletteType) => T,
): T {
  const mode = useThemeStore((state) => state.mode);
  return useMemo(() => {
    const palette = mode === 'light' ? getLightPalette() : getDarkPalette();
    return factory(palette);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
}

/**
 * Returns the current palette object, re-rendering when theme changes.
 * Use for inline styles: `const palette = usePalette();`
 */
export function usePalette(): PaletteType {
  const mode = useThemeStore((state) => state.mode);
  return useMemo(() => {
    return (mode === 'light' ? getLightPalette() : getDarkPalette()) as PaletteType;
  }, [mode]);
}
