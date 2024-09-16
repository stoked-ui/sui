import * as React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { debounce } from '@mui/material/utils';
import {alpha, styled, Theme} from '@mui/material/styles';
import { unstable_useId as useId } from '@mui/utils';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import NoSsr from '@mui/material/NoSsr';
import { useUserLanguage, useTranslate } from '../i18n';
import HighlightedCode from '../HighlightedCode';
import DemoSandbox from './DemoSandbox';
import ReactRunner from '../ReactRunner';
import DemoEditor from './DemoEditor';
import DemoEditorError from './DemoEditorError';
import { pathnameToLanguage } from '../utils/helpers';
import { useCodeVariant } from '../utils/codeVariant';
import { useCodeStyling } from '../utils/codeStylingSolution';
import { CODE_VARIANTS, CODE_STYLING } from '../components/constants';
import stylingSolutionMapping from '../utils/stylingSolutionMapping';
import DemoToolbarRoot from './DemoToolbarRoot';

/**
 * Removes leading spaces (indentation) present in the `.tsx` previews
 * to be able to replace the existing code with the incoming dynamic code
 * @param {string} input
 */
function trimLeadingSpaces(input = '') {
  return input.replace(/^\s+/gm, '');
}

const DemoToolbar = React.lazy(() => import('./DemoToolbar'));

function DemoToolbarFallback() {
  const t = useTranslate();

  // Sync with styles from DemoToolbar, we can't import the styles
  return <Box sx={{ height: 40 }} aria-busy aria-label={t('demoToolbarLabel')} role="toolbar" />;
}

function getDemoName(location) {
  return location?.endsWith('.js') || location?.endsWith('.tsx')
    ? location?.replace(/(.+?)(\w+)\.\w+$$/, '$2')
    : // the demos with multiple styling solution point to directory
      location?.split('/').pop();
}

function useDemoData(codeVariant, demo, githubLocation, codeStyling) {
  const userLanguage = useUserLanguage();
  const router = useRouter();
  const { canonicalAs } = pathnameToLanguage(router.asPath);

  return React.useMemo(() => {
    let productId;
    let name = 'Material UI';
    if (canonicalAs.startsWith('/joy-ui/')) {
      productId = 'joy-ui';
      name = 'Joy UI';
    } else if (canonicalAs.startsWith('/base-ui/')) {
      productId = 'base-ui';
      name = 'Base UI';
    } else if (canonicalAs.startsWith('/x/')) {
      name = 'SUI X';
    }

    let codeOptions: {
      codeVariant: string,
      githubLocation: string,
      raw: any,
      Component: any,
      sourceLanguage: string | undefined
    } | {} = {};

    if (codeStyling === CODE_STYLING.SYSTEM) {
      if (codeVariant === CODE_VARIANTS.TS && demo.rawTS) {
        codeOptions = {
          codeVariant: CODE_VARIANTS.TS,
          githubLocation: githubLocation.replace(/\.js$/, '.tsx'),
          raw: demo.rawTS,
          Component: demo.tsx,
          sourceLanguage: 'tsx',
        };
      } else {
        codeOptions = {
          codeVariant: CODE_VARIANTS.JS,
          githubLocation,
          raw: demo.raw,
          Component: demo.js,
          sourceLanguage: 'jsx',
        };
      }
    } else if (codeStyling === CODE_STYLING.TAILWIND) {
      if (codeVariant === CODE_VARIANTS.TS && demo.rawTailwindTS) {
        codeOptions = {
          codeVariant: CODE_VARIANTS.TS,
          githubLocation: githubLocation.replace(/\/system\/index\.js$/, '/tailwind/index.tsx'),
          raw: demo.rawTailwindTS,
          Component: demo.tsxTailwind,
          sourceLanguage: 'tsx',
        };
      } else {
        codeOptions = {
          codeVariant: CODE_VARIANTS.JS,
          githubLocation: githubLocation.replace(/\/system\/index\.js$/, '/tailwind/index.js'),
          raw: demo.rawTailwind ?? demo.raw,
          Component: demo.jsTailwind ?? demo.js,
          sourceLanguage: 'jsx',
        };
      }
    } else if (codeStyling === CODE_STYLING.CSS) {
      if (codeVariant === CODE_VARIANTS.TS && demo.rawCSSTS) {
        codeOptions = {
          codeVariant: CODE_VARIANTS.TS,
          githubLocation: githubLocation.replace(/\/system\/index\.js$/, '/css/index.tsx'),
          raw: demo.rawCSSTS,
          Component: demo.tsxCSS,
          sourceLanguage: 'tsx',
        };
      } else {
        codeOptions = {
          codeVariant: CODE_VARIANTS.JS,
          githubLocation: githubLocation.replace(/\/system\/index\.js$/, '/css/index.js'),
          raw: demo.rawCSS ?? demo.raw,
          Component: demo.jsCSS ?? demo.js,
          sourceLanguage: 'jsx',
        };
      }
    }

    let jsxPreview = demo.jsxPreview;
    if (codeStyling === CODE_STYLING.TAILWIND && demo.tailwindJsxPreview) {
      jsxPreview = demo.tailwindJsxPreview;
    } else if (codeStyling === CODE_STYLING.CSS && demo.cssJsxPreview) {
      jsxPreview = demo.cssJsxPreview;
    }

    return {
      scope: demo.scope,
      jsxPreview,
      ...codeOptions,
      title: `${getDemoName(githubLocation)} demo — ${name}`,
      productId,
      language: userLanguage,
      codeStyling,
    };
  }, [canonicalAs, codeVariant, demo, githubLocation, userLanguage, codeStyling]);
}

function useDemoElement({ demoData, editorCode, setDebouncedError, liveDemoActive }) {
  const debouncedSetError = React.useMemo(
    () => debounce(setDebouncedError, 300),
    [setDebouncedError],
  );

  React.useEffect(() => {
    return () => {
      debouncedSetError.clear();
    };
  }, [debouncedSetError]);

  // Memoize to avoid rendering the demo more than it needs to be.
  // For example, avoid a render when the demo is hovered.
  const BundledComponent = React.useMemo(() => <demoData.Component />, [demoData]);
  const LiveComponent = React.useMemo(
    () => (
      <ReactRunner
        scope={demoData.scope}
        onError={debouncedSetError}
        code={
          editorCode.isPreview
            ? trimLeadingSpaces(demoData.raw).replace(
                trimLeadingSpaces(demoData.jsxPreview),
                editorCode.value,
              )
            : editorCode.value
        }
      />
    ),
    [demoData, debouncedSetError, editorCode.isPreview, editorCode.value],
  );

  // No need for a live environment if the code matches with the component rendered server-side.
  return editorCode.value === editorCode.initialEditorCode && liveDemoActive === false
    ? BundledComponent
    : LiveComponent;
}

const Root = styled('div', {
  shouldForwardProp: (prop) => prop !== 'noMargins',
})<{ noMargins: boolean }>(({ theme, noMargins }: { theme: Theme, noMargins: boolean }) => ({
  marginBottom: 0,
  marginLeft: theme?.spacing(noMargins ? 0 : -2),
  marginRight: theme?.spacing(noMargins ? 0 : -2),
  [theme.breakpoints.up('sm')]: {
    marginLeft: 0, marginRight: 0,
  },
}));

type Bg = 'outlined' | 'inline' | 'gradient' | 'playground' | 'noMargin' | true;

const DemoRootMaterial = styled('div', {
  shouldForwardProp: (prop) => prop !== 'hideToolbar' && prop !== 'bg',
})<{ hideToolbar: boolean, bg: Bg }>(({ theme, hideToolbar, bg }) => ({
  position: 'relative',
  margin: 'auto',
  display: 'flex',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    borderRadius: hideToolbar ? 12 : '12px 12px 0 0',
    ...(bg === 'outlined' && {
      borderLeftWidth: 1,
      borderRightWidth: 1,
    }),
    /* Make no difference between the demo and the markdown. */
    ...(bg === 'inline' && {
      padding: theme.spacing(0),
    }),
    ...(bg === 'gradient' && {
      padding: theme.spacing(12, 8),
      borderLeftWidth: 1,
      borderRightWidth: 1,
    }),
  },
  /* Isolate the demo with an outline. */
  ...(bg === 'outlined' && {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    ...theme.applyDarkStyles({
      backgroundColor: alpha(theme.palette.primaryDark[700], 0.1),
    }),
  }),
  /* Similar to the outlined one but without padding. Ideal for playground demos. */
  ...(bg === 'playground' && {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'auto',
  }),
  /* Prepare the background to display an inner elevation. */
  ...(bg === true && {
    padding: theme.spacing(3),
    backgroundColor: alpha(theme.palette.grey[50], 0.5),
    border: `1px solid ${theme.palette.divider}`,
    ...theme.applyDarkStyles({
      backgroundColor: alpha(theme.palette.primaryDark[700], 0.4),
    }),
  }),
  ...(bg === 'noMargin' && {
    border: `1px solid ${theme.palette.divider}`,
  }),
  /* Mostly meant for introduction demos. */
  ...(bg === 'gradient' && {
    overflow: 'auto',
    padding: theme.spacing(4, 2),
    border: `1px solid ${theme.palette.divider}`,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    backgroundClip: 'padding-box',
    backgroundColor: alpha(theme.palette.primary[50], 0.2),
    backgroundImage: `radial-gradient(120% 140% at 50% 10%, transparent 40%, ${alpha(theme.palette.primary[100], 0.2)} 70%)`,
    ...theme.applyDarkStyles({
      backgroundColor: theme.palette.primaryDark[900],
      backgroundImage: `radial-gradient(120% 140% at 50% 10%, transparent 30%, ${alpha(theme.palette.primary[900], 0.3)} 80%)`,
    }),
  }),
}));

const DemoCodeViewer = styled(HighlightedCode)(() => ({
  '& pre': {
    margin: 0,
    maxHeight: 'min(68vh, 1000px)',
    maxWidth: 'initial',
    borderRadius: 0,
  },
  '& .MuiCode-copy': {
    display: 'none',
  },
}));

const AnchorLink = styled('div')({
  marginTop: -64, // height of toolbar
  position: 'absolute',
});

const InitialFocus = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: theme.spacing(4),
  height: theme.spacing(4),
  pointerEvents: 'none',
}));

export default function Demo(props) {
  const { demo, demoOptions, disableAd, githubLocation, mode } = props;

  if (process.env.NODE_ENV !== 'production') {
    if (demoOptions.hideToolbar === false) {
      throw new Error(
        [
          '"hideToolbar": false is already the default.',
          `Please remove the property in {{"demo": "${demoOptions.demo}", …}}.`,
        ].join('\n'),
      );
    }
    if (demoOptions.hideToolbar === true && demoOptions.defaultCodeOpen === true) {
      throw new Error(
        [
          '"hideToolbar": true, "defaultCodeOpen": true combination is invalid.',
          `Please remove one of the properties in {{"demo": "${demoOptions.demo}", …}}.`,
        ].join('\n'),
      );
    }
    if (demoOptions.hideToolbar === true && demoOptions.disableAd === true) {
      throw new Error(
        [
          '"hideToolbar": true, "disableAd": true combination is invalid.',
          `Please remove one of the properties in {{"demo": "${demoOptions.demo}", …}}.`,
        ].join('\n'),
      );
    }
  }

  if (
    (demoOptions.demo.endsWith('.ts') || demoOptions.demo.endsWith('.tsx')) &&
    demoOptions.hideToolbar !== true
  ) {
    throw new Error(
      [
        `The following demos use TS directly: ${demoOptions.demo}.`,
        '',
        'Please run "pnpm docs:typescript:formatted" to generate a JS version and reference it:',
        `{{"demo": "${demoOptions.demo.replace(/\.(.*)$/, '.js')}", …}}.`,
        '',
        "Otherwise, if it's not a code demo hide the toolbar:",
        `{{"demo": "${demoOptions.demo}", "hideToolbar": true, …}}.`,
      ].join('\n'),
    );
  }

  const t = useTranslate();
  const codeVariant = useCodeVariant();
  const styleSolution = useCodeStyling();

  const demoData = useDemoData(codeVariant, demo, githubLocation, styleSolution);

  const hasNonSystemDemos = demo.rawTailwind || demo.rawTailwindTS || demo.rawCSS || demo.rawCSSTs;

  const demoName = getDemoName(demoData.githubLocation);
  const demoSandboxedStyle = React.useMemo(
    () => ({
      maxWidth: demoOptions.maxWidth,
      height: demoOptions.height,
    }),
    [demoOptions.height, demoOptions.maxWidth],
  );

  if (demoOptions.bg == null) {
    demoOptions.bg = 'outlined';

    if (demoOptions.iframe) {
      demoOptions.bg = true;
    }
  }

  const [codeOpen, setCodeOpen] = React.useState(demoOptions.defaultCodeOpen || false);
  const shownOnce = React.useRef(false);
  if (codeOpen) {
    shownOnce.current = true;
  }

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const navigatedDemoName = getDemoName(window.location.hash);
      if (navigatedDemoName && demoName === navigatedDemoName) {
        setCodeOpen(true);
      }
    }
  }, [demoName]);

  const showPreview =
    !demoOptions.hideToolbar &&
    demoOptions.defaultCodeOpen !== false &&
    Boolean(demoData.jsxPreview);

  const [demoKey, setDemoKey] = React.useReducer((key) => key + 1, 0);

  const demoId = `demo-${useId()}`;
  const demoSourceId = `demoSource-${useId()}`;
  const openDemoSource = codeOpen || showPreview;

  const initialFocusRef = React.useRef(null);

  const [showAd, setShowAd] = React.useState(false);
  const adVisibility = showAd && !disableAd && !demoOptions.disableAd;

  const DemoRoot = DemoRootMaterial;
  const Wrapper = React.Fragment;

  const isPreview = !codeOpen && showPreview;

  const initialEditorCode = isPreview
    ? demoData.jsxPreview
    : // Prettier remove all the leading lines except for the last one, remove it as we don't
      // need it in the live edit view.
      demoData.raw.replace(/\n$/, '');
  const [editorCode, setEditorCode] = React.useState({
    value: initialEditorCode,
    isPreview,
    initialEditorCode,
  });

  const resetDemo = React.useMemo(
    () => () => {
      setEditorCode({
        value: initialEditorCode,
        isPreview,
        initialEditorCode,
      });
      setDemoKey();
    },
    [setEditorCode, setDemoKey, initialEditorCode, isPreview],
  );

  React.useEffect(() => {
    setEditorCode({
      value: initialEditorCode,
      isPreview,
      initialEditorCode,
    });
  }, [initialEditorCode, isPreview]);

  const [debouncedError, setDebouncedError] = React.useState(null);

  const [liveDemoActive, setLiveDemoActive] = React.useState(false);

  const demoElement = useDemoElement({
    demoData,
    editorCode,
    setDebouncedError,
    liveDemoActive,
  });

  return (
    <Root noMargins={demoOptions.noMargins}>
      <AnchorLink id={demoName} />
      <DemoRoot hideToolbar={demoOptions.hideToolbar} bg={demoOptions.bg} id={demoId}>
        <Wrapper {...(demoData.productId === 'joy-ui' && { mode })}>
          <InitialFocus
            aria-label={t('initialFocusLabel')}
            action={initialFocusRef}
            tabIndex={-1}
          />
        </Wrapper>
        <DemoSandbox
          key={demoKey}
          sx={demoSandboxedStyle}
          iframe={demoOptions.iframe}
          productId={demoData.productId}
          name={demoName}
          onResetDemoClick={resetDemo}
        >
          {demoElement}
        </DemoSandbox>
      </DemoRoot>
      {/* TODO: Wrapper shouldn't be needed, it should already be at the top of the docs page */}
      {demoOptions.hideToolbar ? null : (
        <Wrapper {...(demoData.productId === 'joy-ui' ? { mode } : {})}>
          {Object.keys(stylingSolutionMapping).map((key) => (
            <React.Fragment key={key}>
              <AnchorLink id={`${stylingSolutionMapping[key]}-${demoName}.js`} />
              <AnchorLink id={`${stylingSolutionMapping[key]}-${demoName}.tsx`} />
            </React.Fragment>
          ))}
          <AnchorLink id={`${demoName}.js`} />
          <AnchorLink id={`${demoName}.tsx`} />
          <DemoToolbarRoot demoOptions={demoOptions} openDemoSource={openDemoSource}>
            <NoSsr fallback={<DemoToolbarFallback />}>
              <React.Suspense fallback={<DemoToolbarFallback />}>
                <DemoToolbar
                  codeOpen={codeOpen}
                  codeVariant={codeVariant}
                  hasNonSystemDemos={hasNonSystemDemos}
                  demo={demo}
                  demoData={demoData}
                  demoId={demoId}
                  demoName={demoName}
                  demoOptions={demoOptions}
                  demoSourceId={demoSourceId}
                  initialFocusRef={initialFocusRef}
                  onCodeOpenChange={() => {
                    setCodeOpen((open) => !open);
                    setShowAd(true);
                  }}
                  onResetDemoClick={resetDemo}
                  openDemoSource={openDemoSource}
                  showPreview={showPreview}
                />
              </React.Suspense>
            </NoSsr>
          </DemoToolbarRoot>
          <Collapse in={openDemoSource} unmountOnExit timeout={150}>
            {/* A limitation from https://github.com/nihgwu/react-runner,
                we can't inject the `window` of the iframe so we need a disableLiveEdit option. */}
            {demoOptions.disableLiveEdit ? (
              <DemoCodeViewer
                code={editorCode.value}
                id={demoSourceId}
                language={demoData.sourceLanguage}
                copyButtonProps={{
                  'data-ga-event-category': codeOpen ? 'demo-expand' : 'demo',
                  'data-ga-event-label': demo.gaLabel,
                  'data-ga-event-action': 'copy-click',
                }}
              />
            ) : (
              <DemoEditor
                // Mount a new text editor when the preview mode change to reset the undo/redo history.
                key={`${editorCode.isPreview}`}
                value={editorCode.value}
                onChange={(value) => {
                  setEditorCode({
                    ...editorCode,
                    value,
                  });
                }}
                onFocus={() => {
                  setLiveDemoActive(true);
                }}
                id={demoSourceId}
                language={demoData.sourceLanguage ?? 'tsx'}
                copyButtonProps={{
                  'data-ga-event-category': codeOpen ? 'demo-expand' : 'demo',
                  'data-ga-event-label': demo.gaLabel,
                  'data-ga-event-action': 'copy-click',
                }}
              >
                <DemoEditorError>{debouncedError}</DemoEditorError>
              </DemoEditor>
            )}
          </Collapse>
          {adVisibility ? <React.Fragment /> : null}
        </Wrapper>
      )}
    </Root>
  );
}

Demo.propTypes = {
  demo: PropTypes.object.isRequired,
  /**
   * The options provided with: {{"demo": "Name.js", …demoOptions}}
   */
  demoOptions: PropTypes.object.isRequired,
  disableAd: PropTypes.bool.isRequired,
  githubLocation: PropTypes.string.isRequired,
  mode: PropTypes.string, // temporary, just to make Joy docs work.
} as any;
