/* eslint-disable react-refresh/only-export-components */
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import type { PaletteMode } from '@mui/material/styles';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { createAppTheme } from './theme';

type ColorModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

const storageKey = 'nwl-panel.color-mode';
const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<PaletteMode>(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, mode);
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggleMode: () =>
        setMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark')),
    }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error('useColorMode must be used inside ColorModeProvider');
  }

  return context;
}
