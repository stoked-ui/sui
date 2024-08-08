import * as React from 'react';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  PRODUCTS,
  ProductStackProps,
  ProductSwipeableProps
} from "../../products";


export default function ProductsSwitcher(props: ProductStackProps) {
  const { inView = false, productIndex, setProductIndex } = props;
  const isBelowMd = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <React.Fragment>
      {PRODUCTS.swipeable({ show: isBelowMd && inView, productIndex, setProductIndex } as ProductSwipeableProps)}
      {PRODUCTS.stack(props)}
    </React.Fragment>
  );
}
