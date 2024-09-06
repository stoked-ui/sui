import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconImage from 'docs/src/components/icon/IconImage';
import ROUTES from 'docs/src/route';
import { Link } from '@mui/docs/Link';
import PageContext from 'docs/src/modules/components/PageContext';
import { ALL_PRODUCTS } from 'docs/src/products';

interface ProductSubMenuProp extends BoxProps {
  icon: React.ReactNode;
  name: React.ReactNode;
  description: React.ReactNode;
  acronym?: React.ReactNode
  chip?: React.ReactNode;
}

function ProductSubMenu(props: ProductSubMenuProp & {  }) {
  const { icon, name, description, chip, sx, acronym = [], ...other } = props;
  return (
    <Box
      {...other}
      sx={[
        {
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {icon}
      <Box sx={{ flexGrow: 1 }}>
        <Typography color="text.primary" sx={{ display: "flex", flexDirection: "row"}} variant="body2" fontWeight="700">
          {acronym}
          {name}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
      </Box>
      {chip}
    </Box>
  );
}

const coreProducts = [
  {
    name: 'Stoked UI',
    href: ROUTES.materialDocs,
    id: 'material-ui',
  },
  {
    name: 'Joy UI',
    href: ROUTES.joyDocs,
    id: 'joy-ui',
  },
  {
    name: 'Base UI',
    href: ROUTES.baseDocs,
    id: 'base-ui',
  },
  {
    name: 'SUI System',
    href: ROUTES.systemDocs,
    id: 'system',
  },
];

const advancedProducts = [
  {
    name: 'Data Grid',
    href: ROUTES.dataGridOverview,
    id: 'x-data-grid',
  },
  {
    name: 'Date and Time Pickers',
    href: ROUTES.datePickersOverview,
    id: 'x-date-pickers',
  },
  {
    name: 'Charts',
    href: ROUTES.chartsOverview,
    id: 'x-charts',
  },
  {
    name: 'File Explorer',
    href: ROUTES.treeViewOverview,
    id: 'x-tree-view',
  },
];

export default function MuiProductSelector() {
  const pageContext = React.useContext(PageContext);

  return ALL_PRODUCTS.productSelector(pageContext);
}
