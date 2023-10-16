/* eslint-disable react/no-danger */
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { useTranslate } from 'docs/src/modules/utils/i18n';
import ToggleDisplayOption, {
  API_LAYOUT_STORAGE_KEYS,
  useApiPageOption,
} from 'docs/src/modules/components/ApiPage/sections/ToggleDisplayOption';
import PropertiesList, { getHash } from 'docs/src/modules/components/ApiPage/list/PropertiesList';
import PropertiesTable from 'docs/src/modules/components/ApiPage/table/PropertiesTable';

export const getPropsToC = ({
  componentName,
  componentProps,
  inheritance,
  themeDefaultProps,
  t,
  hash,
}) => ({
  text: t('api-docs.props'),
  hash: hash ?? 'props',
  children: [
    ...Object.entries(componentProps)
      .filter(([, propData]) => propData.description !== '@ignore')
      .map(([propName]) => ({
        text: propName,
        hash: getHash({ propName, targetName: componentName }),
        children: [],
      })),
    ...(inheritance
      ? [{ text: t('api-docs.inheritance'), hash: 'inheritance', children: [] }]
      : []),
    ...(themeDefaultProps
      ? [{ text: t('api-docs.themeDefaultProps'), hash: 'theme-default-props', children: [] }]
      : []),
  ],
});

export default function PropertiesSection(props) {
  const {
    properties,
    propertiesDescriptions,
    targetName = '',
    showOptionalAbbr = false,
    title = 'api-docs.props',
    titleHash = 'props',
    level: Level = 'h2',
    spreadHint,
    hooksParameters = false,
    hooksReturnValue = false,
  } = props;
  const t = useTranslate();

  const [displayOption, setDisplayOption] = useApiPageOption(API_LAYOUT_STORAGE_KEYS.props);
  const formatedProperties = Object.entries(properties)
    .filter(([, propData]) => propData.description !== '@ignore')
    .map(([propName, propData]) => {
      const isRequired = propData.required && !showOptionalAbbr;
      const isOptional = !propData.required && showOptionalAbbr;

      const isDeprecated = propData.deprecated;
      const deprecationInfo = propData.deprecationInfo
        ?.replace(/<code>/g, '<span>')
        ?.replace(/<\/code>/g, '</span>');

      const typeName = propData.type?.description || propData.type.name;
      const propDefault = propData.default;
      const propDescription = propertiesDescriptions[propName];

      const additionalInfo = [
        'cssApi',
        'sx',
        'slotsApi',
        'joy-size',
        'joy-color',
        'joy-variant',
      ].filter((key) => propData.additionalInfo?.[key]);

      const signature = propData.signature?.type;
      const signatureArgs = propData.signature?.describedArgs?.map((argName) => ({
        argName,
        argDescription: propertiesDescriptions[propName].typeDescriptions[argName],
      }));
      const signatureReturnDescription =
        propData.signature?.returned &&
        propertiesDescriptions[propName].typeDescriptions[propData.signature.returned];

      return {
        targetName,
        propName,
        description: propDescription?.description,
        requiresRef: propDescription?.requiresRef,
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
      };
    });

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
        <Level id={titleHash} style={{ flexGrow: 1 }}>
          {t(title)}
          <a
            aria-labelledby={titleHash}
            className="anchor-link"
            href={`#${titleHash}`}
            tabIndex={-1}
          >
            <svg>
              <use xlinkHref="#anchor-link-icon" />
            </svg>
          </a>
        </Level>
        <ToggleDisplayOption displayOption={displayOption} setDisplayOption={setDisplayOption} />
      </Box>

      {spreadHint && <p dangerouslySetInnerHTML={{ __html: spreadHint }} />}

      {displayOption === 'table' ? (
        <PropertiesTable properties={formatedProperties} />
      ) : (
        <PropertiesList properties={formatedProperties} displayOption={displayOption} />
      )}
    </React.Fragment>
  );
}

PropertiesSection.propTypes = {
  hooksParameters: PropTypes.bool,
  hooksReturnValue: PropTypes.bool,
  level: PropTypes.string,
  properties: PropTypes.object.isRequired,
  propertiesDescriptions: PropTypes.object.isRequired,
  showOptionalAbbr: PropTypes.bool,
  spreadHint: PropTypes.string,
  targetName: PropTypes.string,
  title: PropTypes.string,
  titleHash: PropTypes.string,
};
