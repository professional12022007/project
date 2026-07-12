import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Palette, setPalette, getDarkPalette, getLightPalette, type PaletteType } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark';

type ThemeState = {
  mode: ThemeMode;
  palette: PaletteType;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  init: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      palette: getDarkPalette(),
      setMode: (mode) => {
        const palette = mode === 'light' ? getLightPalette() : getDarkPalette();
        setPalette(palette);
        set({ mode, palette });
      },
      toggle: () => {
        const next = get().mode === 'dark' ? 'light' : 'dark';
        get().setMode(next);
      },
      init: () => {
        const palette = get().mode === 'light' ? getLightPalette() : getDarkPalette();
        setPalette(palette);
      },
    }),
    {
      name: '@benefitos_theme',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const palette = state.mode === 'light' ? getLightPalette() : getDarkPalette();
          setPalette(palette);
        }
      },
    }
  )
);
