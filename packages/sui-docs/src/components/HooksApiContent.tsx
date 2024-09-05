import * as React from 'react';
import kebabCase from 'lodash/kebabCase';
import { useTranslate, useUserLanguage } from '@mui/docs/i18n';
import PropertiesSection from '../ApiPage/sections/PropertiesSection';
import HighlightedCode from '../HighlightedCode/HighlightedCode';
import MarkdownElement from '../Markdown/MarkdownElement';
import { DEFAULT_API_LAYOUT_STORAGE_KEYS } from '../ApiPage/sections/ToggleDisplayOption';

interface HeadingProps {
  hash: string;
  text?: string;
  level?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

function Heading({ hash, text, level: Level = 'h2' }: HeadingProps): React.ReactElement {
  const t = useTranslate();

  return (
    <Level id={hash}>
      {getTranslatedHeader(t, hash, text)}
      <a aria-labelledby={hash} className="anchor-link" href={`#${hash}`} tabIndex={-1}>
        <svg>
          <use xlinkHref="#anchor-link-icon" />
        </svg>
      </a>
    </Level>
  );
}

function getTranslatedHeader(t: (key: string) => string, header: string, text?: string): string {
  const translations: { [key: string]: string } = {
    demos: t('api-docs.demos'),
    import: t('api-docs.import'),
    'hook-name': t('api-docs.hookName'),
    parameters: t('api-docs.parameters'),
    'return-value': t('api-docs.returnValue'),
  };

  return translations[header] || translations[text || ''] || text || header;
}

interface HooksApiContentProps {
  descriptions: any;
  pagesContents: any;
  defaultLayout?: 'collapsed' | 'expanded' | 'table';
  layoutStorageKey?: string;
}

function HooksApiContent({
  descriptions,
  pagesContents,
  defaultLayout = 'table',
  layoutStorageKey = DEFAULT_API_LAYOUT_STORAGE_KEYS,
}: HooksApiContentProps): React.ReactElement {
  const userLanguage = useUserLanguage();
  const t = useTranslate();

  const hooks = Object.keys(pagesContents);

  return (
    <React.Fragment>
      {hooks.map((key) => {
        const { name: hookName, parameters, returnValue, imports } = pagesContents[key];
        const { parametersDescriptions, returnValueDescriptions } = descriptions[key][userLanguage];
        const hookNameKebabCase = kebabCase(hookName);
        const importInstructions = imports.join(`\n// ${t('or')}\n`);

        return (
          <React.Fragment key={`hook-api-${key}`}>
            <MarkdownElement>
              <Heading hash={hookNameKebabCase} text={`${hookName} API`} />
              <Heading text="import" hash={`${hookNameKebabCase}-import`} level="h3" />
              <HighlightedCode code={importInstructions} language="jsx" />
              <p dangerouslySetInnerHTML={{ __html: t('api-docs.importDifference') }} />
              {Object.keys(parameters).length > 0 ? (
                <PropertiesSection
                  properties={parameters}
                  propertiesDescriptions={parametersDescriptions}
                  componentName={hookName}
                  hooksParameters
                  level="h3"
                  title="api-docs.parameters"
                  titleHash={`${hookNameKebabCase}-parameters`}
                  defaultLayout={defaultLayout}
                  layoutStorageKey={layoutStorageKey}
                />
              ) : (
                <span>{t('api-docs.hooksNoParameters')}</span>
              )}
              <PropertiesSection
                properties={returnValue}
                propertiesDescriptions={returnValueDescriptions}
                componentName={hookName}
                showOptionalAbbr
                hooksReturnValue
                level="h3"
                title="api-docs.returnValue"
                titleHash={`${hookNameKebabCase}-return-value`}
                defaultLayout={defaultLayout}
                layoutStorageKey={layoutStorageKey}
              />
              <br />
            </MarkdownElement>
            <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
              <symbol id="anchor-link-icon" viewBox="0 0 16 16">
                <path d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z" />
              </symbol>
            </svg>
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
}

export default HooksApiContent;
