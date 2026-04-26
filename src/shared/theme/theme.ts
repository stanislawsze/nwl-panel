import { createTheme, type PaletteMode } from '@mui/material/styles';

const blue = {
  main: '#2563eb',
  light: '#60a5fa',
  dark: '#1d4ed8',
};

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: blue,
      secondary: {
        main: isDark ? '#94a3b8' : '#334155',
      },
      background: {
        default: isDark ? '#090d14' : '#f3f6fb',
        paper: isDark ? '#111827' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e5edf8' : '#0f172a',
        secondary: isDark ? '#9ca3af' : '#64748b',
      },
      divider: isDark ? '#243244' : '#dbe3ef',
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      button: {
        fontWeight: 800,
        textTransform: 'none',
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: 'contained',
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${isDark ? '#243244' : '#dbe3ef'}`,
            boxShadow: 'none',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
      },
    },
  });
}
