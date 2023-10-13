/* eslint-disable react/no-danger */
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { useTranslate } from 'docs/src/modules/utils/i18n';
import {
  brandingDarkTheme as darkTheme,
  brandingLightTheme as lightTheme,
} from 'docs/src/modules/brandingTheme';
import ExpendableApiItem, {
  ApiItemContaier,
} from 'docs/src/modules/components/ApiPage/list/ExpendableApiItem';

const StyledApiItem = styled(ExpendableApiItem)(
  ({ theme }) => ({
    '& .prop-list-description': {
      marginBottom: 10,
    },
    '& .prop-list-additional-info': {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      '&>p': {
        margin: 0,
      },
      '& .prop-list-title': {
        ...theme.typography.body2,
        fontWeight: theme.typography.fontWeightSemiBold,
        color: theme.palette.text.primary,
        paddingRight: 5,
        whiteSpace: 'nowrap',
        margin: 0,
      },
      '& .default-value': {
        fontSize: theme.typography.pxToRem(12),
      },
    },
    '& .prop-list-default-props': {
      ...theme.typography.body2,
      fontWeight: theme.typography.fontWeightSemiBold,
    },
    '& .prop-list-signature': {
      p: {
        ...theme.typography.body2,
        fontWeight: theme.typography.fontWeightSemiBold,
        marginBottom: 8,
      },
      ul: {
        paddingLeft: 24,
        marginTop: 2,
        marginBottom: 0,
      },
      '&>code': {
        borderRadius: 8,
        padding: 12,
        width: '100%',
        marginBottom: 8,
        color: `var(--muidocs-palette-grey-900, ${lightTheme.palette.grey[50]})`,
        border: '1px solid',
        borderColor: `var(--muidocs-palette-primaryDark-700, ${lightTheme.palette.primaryDark[700]})`,
        backgroundColor: `var(--muidocs-palette-primaryDark-800, ${lightTheme.palette.primaryDark[800]})`,
      },
    },
  }),
  ({ theme }) => ({
    [`:where(${theme.vars ? '[data-mui-color-scheme="dark"]' : '.mode-dark'}) &`]: {
      '& .prop-list-additional-info': {
        '& .prop-list-title': {
          p: {
            color: `var(--muidocs-palette-grey-50, ${darkTheme.palette.grey[50]})`,
          },
        },
      },

      '& .prop-list-default-props': {
        color: `var(--muidocs-palette-grey-300, ${darkTheme.palette.grey[300]})`,
      },
    },
  }),
);

function PropDescription({ description }: { description: string }) {
  const isUlPresent = description.includes('<ul>');

  const ComponentToRender = isUlPresent ? 'div' : 'p';

  return (
    <ComponentToRender
      className="prop-list-description" // This className is used by Algolia
      dangerouslySetInnerHTML={{
        __html: description,
      }}
    />
  );
}

PropDescription.propTypes = {
  description: PropTypes.string.isRequired,
};

export const getHash = ({
  targetName,
  propName,
  hooksParameters,
  hooksReturnValue,
}: {
  targetName: string;
  propName: string;
  hooksParameters?: boolean;
  hooksReturnValue?: boolean;
}) => {
  let sectionName = 'prop';
  if (hooksParameters) {
    sectionName = 'parameters';
  } else if (hooksReturnValue) {
    sectionName = 'return-value';
  }
  return `${targetName ? `${targetName}-` : ''}${sectionName}-${propName}`;
};

export interface PropDescriptionParams {
  targetName: string;
  propName: string;
  description?: string;
  requiresRef?: string;
  isOptional?: boolean;
  isRequired?: boolean;
  isDeprecated?: boolean;
  hooksParameters?: boolean;
  hooksReturnValue?: boolean;
  deprecationInfo?: string;
  typeName: string;
  propDefault?: string;
  additionalInfo: string[];
  signature?: string;
  signatureArgs?: { argName: string; argDescription?: string }[];
  signatureReturnDescription?: string;
}

interface PropertiesListProps {
  properties: PropDescriptionParams[];
  displayOption: 'collapsed' | 'expended';
}

export default function PropertiesList(props: PropertiesListProps) {
  const { properties, displayOption } = props;
  const t = useTranslate();
  return (
    <ApiItemContaier>
      {properties.map((params) => {
        const {
          targetName,
          propName,
          description,
          requiresRef,
          isOptional,
          isRequired,
          isDeprecated,
          hooksParameters,
          hooksReturnValue,
          deprecationInfo,
          typeName,
          propDefault,
          additionalInfo,
          signature,
          signatureArgs,
          signatureReturnDescription,
        } = params;
        return (
          <StyledApiItem
            key={propName}
            id={getHash({ targetName, propName, hooksParameters, hooksReturnValue })}
            title={propName}
            note={(isOptional && 'Optional') || (isRequired && 'Required') || ''}
            type="props"
            displayOption={displayOption}
          >
            {description && <PropDescription description={description} />}

            {requiresRef && (
              <Alert
                severity="warning"
                icon={<WarningRoundedIcon fontSize="small" />}
                sx={{
                  '& .MuiAlert-icon': {
                    height: 'fit-content',
                    py: '8px',
                  },
                }}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('api-docs.requires-ref'),
                  }}
                />
              </Alert>
            )}

            {additionalInfo.map((key) => (
              <p
                className="prop-list-additional-description  MuiApi-collapsible"
                key={key}
                dangerouslySetInnerHTML={{
                  __html: t(`api-docs.additional-info.${key}`),
                }}
              />
            ))}
            {isDeprecated && (
              <Alert
                className="MuiApi-collapsible"
                severity="warning"
                icon={<WarningRoundedIcon fontSize="small" />}
                sx={{
                  '& .MuiAlert-icon': {
                    height: 'fit-content',
                    py: '8px',
                  },
                }}
              >
                {t('api-docs.deprecated')}
                {deprecationInfo && (
                  <React.Fragment>
                    {' - '}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: deprecationInfo
                          .replace(/<code>/g, '<span>')
                          .replace(/<\/code>/g, '</span>'),
                      }}
                    />
                  </React.Fragment>
                )}
              </Alert>
            )}
            <div className="prop-list-additional-info">
              {typeName && (
                <p className="prop-list-type MuiApi-collapsible">
                  <span className="prop-list-title">{t('api-docs.type')}:</span>
                  <code
                    className="Api-code"
                    dangerouslySetInnerHTML={{
                      __html: typeName.replace(/<br>&#124;/g, ' |'),
                    }}
                  />
                </p>
              )}
              {propDefault && (
                <p className="prop-list-default-props MuiApi-collapsible">
                  <span className="prop-list-title">{t('api-docs.default')}:</span>
                  <code className="default-value">{propDefault}</code>
                </p>
              )}
              {signature && (
                <div className="prop-list-signature MuiApi-collapsible">
                  <span className="prop-list-title">{t('api-docs.signature')}:</span>

                  <div className="prop-list-content">
                    <code
                      dangerouslySetInnerHTML={{
                        __html: signature,
                      }}
                    />

                    {signatureArgs && (
                      <div>
                        <ul>
                          {signatureArgs.map(({ argName, argDescription }) => (
                            <li
                              key={argName}
                              dangerouslySetInnerHTML={{
                                __html: `<code>${argName}</code> ${argDescription}`,
                              }}
                            />
                          ))}
                        </ul>
                      </div>
                    )}
                    {signatureReturnDescription && (
                      <p>
                        {t('api-docs.returns')}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: signatureReturnDescription,
                          }}
                        />
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </StyledApiItem>
        );
      })}
    </ApiItemContaier>
  );
}
