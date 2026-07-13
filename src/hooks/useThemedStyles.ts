import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { getDarkPalette, getLightPalette, type PaletteType } from '@/constants/theme';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (palette: PaletteType) => T,
): T {
  const { mode } = useThemeStore();
  return useMemo(() => {
    const palette = mode === 'light' ? getLightPalette() : getDarkPalette();
    return factory(palette);
  }, [mode, factory]);
}

export function usePalette(): PaletteType {
  const { mode } = useThemeStore();
  return useMemo(() => {
    return (mode === 'light' ? getLightPalette() : getDarkPalette()) as PaletteType;
  }, [mode]);
}
