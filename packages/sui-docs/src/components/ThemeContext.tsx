import * as React from 'react';
import {
  ThemeProvider as MdThemeProvider, createTheme as createMdTheme, Direction,
} from '@mui/material/styles';
import {PaletteMode} from "@mui/material";
import { deepmerge } from '@mui/utils';
import { enUS, zhCN, ptBR } from '@mui/material/locale';
import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/material/utils';
import useMediaQuery from '@mui/material/useMediaQuery';
import useLocalStorageState from '@mui/utils/useLocalStorageState';
import { useUserLanguage } from '../i18n';
import { getCookie } from '../utils/helpers';
import useLazyCSS from '../utils/useLazyCSS';
import { getDesignTokens, getThemedComponents, getMetaThemeColor } from '../branding';
import highDensity from "./highDensity";

const languageMap = {
  en: enUS,
  zh: zhCN,
  pt: ptBR,
};

const themeInitialOptions = {
  dense: false,
  direction: 'ltr',
  paletteColors: {},
  spacing: 8, // spacing unit
  paletteMode: 'light',
};

export type ThemeState = typeof themeInitialOptions;

type Action =
  | { type: 'SET_SPACING'; payload: number }
  | { type: 'INCREASE_SPACING' }
  | { type: 'DECREASE_SPACING' }
  | { type: 'SET_DENSE'; payload: boolean }
  | { type: 'RESET_DENSITY' }
  | { type: 'RESET_COLORS' }
  | { type: unknown, payload: any }
  | {
  type: 'CHANGE';
  payload: Partial<Pick<ThemeState, 'paletteMode' | 'direction' | 'paletteColors'>>;
};

export const DispatchContext = React.createContext<React.Dispatch<Action>>(() => {
  throw new Error('Forgot to wrap component in `ThemeProvider`');
});

if (process.env.NODE_ENV !== 'production') {
  DispatchContext.displayName = 'ThemeDispatchContext';
}

export function ThemeProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  const [themeOptions, dispatch] = React.useReducer(
    (state: ThemeState, action: Action): ThemeState => {
      switch (action.type) {
        case 'SET_SPACING':
          return {
            ...state,
            spacing: action.payload,
          };
        case 'INCREASE_SPACING':
          return {
            ...state,
            spacing: state.spacing + 1,
          };
        case 'DECREASE_SPACING':
          return {
            ...state,
            spacing: state.spacing - 1,
          };
        case 'SET_DENSE':
          return {
            ...state,
            dense: action.payload,
          };
        case 'RESET_DENSITY':
          return {
            ...state,
            dense: themeInitialOptions.dense,
            spacing: themeInitialOptions.spacing,
          };
        case 'RESET_COLORS':
          return {
            ...state,
            paletteColors: themeInitialOptions.paletteColors,
          };
        case 'CHANGE':
          if (
            (!action.payload.paletteMode || action.payload.paletteMode === state.paletteMode) &&
            (!action.payload.direction || action.payload.direction === state.direction) &&
            (!action.payload.paletteColors || action.payload.paletteColors === state.paletteColors)
          ) {
            return state;
          }

          return {
            ...state,
            paletteMode: action.payload.paletteMode || state.paletteMode,
            direction: action.payload.direction || state.direction,
            paletteColors: action.payload.paletteColors || state.paletteColors,
          };
        default:
          throw new Error(`Unrecognized type ${action.type}`);
      }
    },
    themeInitialOptions,
  );

  const userLanguage = useUserLanguage();
  const { dense, direction, paletteColors, paletteMode, spacing } = themeOptions;

  useLazyCSS('/static/styles/prism-okaidia.css', '#prismjs');

  const { mode, systemMode } = useColorSchemeShim();
  const calculatedMode = mode === 'system' ? systemMode : mode;

  useEnhancedEffect(() => {
    let nextPaletteColors = JSON.parse(getCookie('paletteColors') || 'null');
    if (nextPaletteColors === null) {
      nextPaletteColors = themeInitialOptions.paletteColors;
    }

    dispatch({
      type: 'CHANGE',
      payload: {
        paletteColors: nextPaletteColors,
        paletteMode: calculatedMode,
      },
    });
  }, [calculatedMode]);

  useEnhancedEffect(() => {
    document.body.dir = direction;
  }, [direction]);

  useEnhancedEffect(() => {
    if (paletteMode === 'dark') {
      document.body.classList.remove('mode-light');
      document.body.classList.add('mode-dark');
    } else {
      document.body.classList.remove('mode-dark');
      document.body.classList.add('mode-light');
    }

    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => {
      meta.setAttribute('content', getMetaThemeColor(paletteMode as 'light' | 'dark'));
    });
  }, [paletteMode]);

  const theme = React.useMemo(() => {
    const brandingDesignTokens = getDesignTokens(paletteMode as 'light' | 'dark');
    const nextPalette = deepmerge(brandingDesignTokens.palette, paletteColors);
    let nextTheme = createMdTheme(
      {
        direction: (direction as Direction | undefined),
        ...brandingDesignTokens,
        palette: {
          ...nextPalette,
          mode: (paletteMode as PaletteMode | undefined),
        },
        components: {
          MuiBadge: {
            // overlap: 'rectangular',
          },
        },
        spacing,
      },
      dense ? highDensity : {},
      {
        components: {
          MuiCssBaseline: {
            defaultProps: {
              enableColorScheme: true,
            },
          },
        },
      },
      languageMap[userLanguage as 'en' | 'zh' | 'pt'],
    );

    nextTheme = deepmerge(nextTheme, getThemedComponents());

    return nextTheme;
  }, [dense, direction, paletteColors, paletteMode, spacing, userLanguage]);

  React.useEffect(() => {
    window.theme = theme;
    window.createTheme = createMdTheme;
  }, [theme]);

  return (
    <MdThemeProvider theme={theme}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </MdThemeProvider>
  );
}

/**
 * @returns {(nextOptions: Partial<typeof themeInitialOptions>) => void}
 */
export function useChangeTheme() {
  const dispatch = React.useContext(DispatchContext);
  return React.useCallback(
    (options: Partial<ThemeState>) => dispatch({ type: 'CHANGE', payload: options }),
    [dispatch],
  );
}

// TODO: remove once all pages support css vars and replace call sites with useColorScheme()
export function useColorSchemeShim() {
  const [mode, setMode] = useLocalStorageState('mui-mode', 'system');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const systemMode = prefersDarkMode ? 'dark' : 'light';

  return {
    mode,
    systemMode,
    setMode,
  };
}
