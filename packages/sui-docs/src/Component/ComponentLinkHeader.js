import * as React from 'react';
import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import ChatRounded from '@mui/icons-material/ChatRounded';
import { styled } from '@mui/material/styles';
import { useTranslate } from '@mui/docs/i18n';
import BundleSizeIcon from '../icon/BundleSizeIcon';
import MaterialDesignIcon from '../MaterialUIComponents/MaterialDesignIcon';

const Root = styled('ul')({
  margin: 0,
  padding: 0,
  listStyle: 'none',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  '& .MuiChip-root': {
    height: 26,
    padding: '0 8px',
    gap: 6,
    '& .MuiChip-label': { padding: 0 },
    '& .MuiChip-iconSmall': {
      margin: 0,
      fontSize: 14,
    },
  },
});

const defaultPackageNames = {
  'material-ui': '@mui/material',
  'joy-ui': '@mui/joy',
  'base-ui': '@mui/base',
  system: '@mui/system',
};

export default function ComponentLinkHeader(props) {
  const {
    markdown: { headers },
    design,
  } = props;
  const t = useTranslate();

  const packageName =
    headers.packageName ?? defaultPackageNames[headers.productId] ?? '@mui/material';

  return (
    <Root>
      {headers.githubLabel ? (
        <li>
          <Chip
            clickable
            role={undefined}
            component="a"
            size="small"
            variant="outlined"
            rel="nofollow"
            href={`${process.env.SOURCE_CODE_REPO}/labels/${encodeURIComponent(
              headers.githubLabel,
            )}`}
            icon={<ChatRounded color="primary" />}
            data-ga-event-category="ComponentLinkHeader"
            data-ga-event-action="click"
            data-ga-event-label={t('githubLabel')}
            data-ga-event-split="0.1"
            label={t('githubLabel')}
          />
        </li>
      ) : null}
      <li>
        <Tooltip title={t('bundleSizeTooltip')} describeChild>
          <Chip
            clickable
            role={undefined}
            component="a"
            size="small"
            variant="outlined"
            rel="nofollow"
            href={`https://bundlephobia.com/package/${packageName}@latest`}
            icon={<BundleSizeIcon color="primary" />}
            data-ga-event-category="ComponentLinkHeader"
            data-ga-event-action="click"
            data-ga-event-label={t('bundleSize')}
            data-ga-event-split="0.1"
            label={t('bundleSize')}
          />
        </Tooltip>
      </li>
      {headers.materialDesign ? (
        <li>
          <Chip
            clickable
            role={undefined}
            component="a"
            size="small"
            variant="outlined"
            rel="nofollow"
            href={headers.materialDesign}
            icon={<MaterialDesignIcon />}
            data-ga-event-category="ComponentLinkHeader"
            data-ga-event-action="click"
            data-ga-event-label="Material Design"
            data-ga-event-split="0.1"
            label="Material Design"
          />
        </li>
      ) : null}
    </Root>
  );
}

ComponentLinkHeader.propTypes = {
  design: PropTypes.bool,
  markdown: PropTypes.shape({
    headers: PropTypes.object.isRequired,
  }).isRequired,
};
