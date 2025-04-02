import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { useTranslate, useUserLanguage } from '../i18n';
import MarkdownElement from './MarkdownElement';
import HighlightedCodeWithTabs from './HighlightedCodeWithTabs';
import Demo from './Demo';

function noComponent(moduleID: any) {
  return function NoComponent() {
    throw new Error(`No demo component provided for '${moduleID}'`);
  };
}

interface RichMarkdownElementProps {
  activeTab?: string,
  demoComponents: any,
  demos?: any,
  disableAd: boolean,
  localizedDoc: any,
  renderedMarkdown: (string | { component: any, demo: any } & any),
  srcComponents: any,
  theme: Theme,
  WrapperComponent: React.ElementType,
  wrapperProps?: object,
}

export default function RichMarkdownElement(props: RichMarkdownElementProps) {
  const {
    demoComponents,
    demos = {},
    disableAd,
    localizedDoc,
    renderedMarkdown,
    srcComponents,
    theme,
    WrapperComponent: Wrapper,
    wrapperProps,
  } = props;
  const userLanguage = useUserLanguage();
  const t = useTranslate();

  if (typeof renderedMarkdown === 'string') {
    return (
      <Wrapper {...wrapperProps}>
        <MarkdownElement renderedMarkdown={renderedMarkdown} />
      </Wrapper>
    );
  }

  if (renderedMarkdown.component) {
    const name = renderedMarkdown.component;
    const Component = srcComponents?.[name];

    if (Component === undefined) {
      throw new Error(`No component found at the path 'docs/src/${name}`);
    }

    return (
      <Wrapper {...wrapperProps}>
        <Component {...renderedMarkdown} markdown={localizedDoc} />
      </Wrapper>
    );
  }

  if (renderedMarkdown.type === 'codeblock') {
    return (
      <Wrapper {...wrapperProps}>
        <HighlightedCodeWithTabs
          tabs={renderedMarkdown.data}
          storageKey={
            renderedMarkdown.storageKey && `codeblock-${renderedMarkdown.storageKey}`
          }
        />
      </Wrapper>
    );
  }

  const name = renderedMarkdown.demo;
  const demo = demos?.[name];
  if (demo === undefined) {
    const errorMessage = [
      `Missing demo: ${name}. You can use one of the following:`,
      Object.keys(demos),
    ].join('\n');

    if (userLanguage === 'en') {
      throw new Error(errorMessage);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error(errorMessage);
    }

    const warnIcon = (
      <span role="img" aria-label={t('emojiWarning')}>
        ⚠️
      </span>
    );
    return (
      <div>
        {warnIcon} Missing demo `{name}` {warnIcon}
      </div>
    );
  }

  const splitLocationBySlash = localizedDoc.location.split('/');
  splitLocationBySlash.pop();
  const fileNameWithLocation = `${splitLocationBySlash.join('/')}/${name}`;

  return (
    <Demo
      {...wrapperProps}
      mode={theme.palette.mode}
      demo={{
        raw: demo.raw,
        js: demoComponents[demo.module] ?? noComponent(demo.module),
        scope: demos.scope,
        jsxPreview: demo.jsxPreview,
        tailwindJsxPreview: demo.tailwindJsxPreview,
        cssJsxPreview: demo.cssJsxPreview,
        rawTS: demo.rawTS,
        tsx: demoComponents[demo.moduleTS] ?? null,
        rawTailwind: demo.rawTailwind,
        rawTailwindTS: demo.rawTailwindTS,
        jsTailwind: demoComponents[demo.moduleTailwind] ?? null,
        tsxTailwind: demoComponents[demo.moduleTSTailwind] ?? null,
        rawCSS: demo.rawCSS,
        rawCSSTS: demo.rawCSSTS,
        jsCSS: demoComponents[demo.moduleCSS] ?? null,
        tsxCSS: demoComponents[demo.moduleTSCSS] ?? null,
        gaLabel: fileNameWithLocation.replace(/^\/docs\/data\//, ''),
      }}
      disableAd={disableAd}
      demoOptions={renderedMarkdown}
      githubLocation={`${process.env.SOURCE_CODE_REPO}/blob/v${process.env.LIB_VERSION}${fileNameWithLocation}`}
    />
  );
}

