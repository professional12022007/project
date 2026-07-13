import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { setPalette, getDarkPalette, getLightPalette, type PaletteType } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  palette: PaletteType;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  init: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = '@benefitos_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        setModeState(stored);
      }
    } catch {}
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const palette = mode === 'light' ? getLightPalette() : getDarkPalette();
    setPalette(palette);
    return {
      mode,
      palette,
      setMode: (m: ThemeMode) => {
        setModeState(m);
        try { localStorage.setItem(STORAGE_KEY, m); } catch {}
      },
      toggle: () => {
        const next = mode === 'dark' ? 'light' : 'dark';
        setModeState(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      },
      init: () => {},
    };
  }, [mode]);

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useThemeStore(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeStore must be used within ThemeProvider');
  }
  return ctx;
}
