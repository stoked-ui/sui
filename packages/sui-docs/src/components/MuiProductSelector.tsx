import * as React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PageContext from './PageContext';
import Products from '../Products'
// import { ALL_PRODUCTS } from 'docs/src/products';

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

export default function MuiProductSelector({ products }: { products: Products }) {
  const pageContext = React.useContext(PageContext);

  return products.productSelector(pageContext as any);
}
