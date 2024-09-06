import * as React from "react";
import ButtonBase from "@mui/material/ButtonBase";
import { Cancelable } from "@mui/utils/debounce";
import { SxProps } from "@mui/system";
import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import KeyboardArrowRightRounded from "@mui/material/SvgIcon/SvgIcon";
import { alpha, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import dynamic from "next/dynamic";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useInView } from "react-intersection-observer";
import Grid from "@mui/material/Grid";
import IconImage from "../icon/IconImage";
import Highlighter from "../action/Highlighter";
import Section from "../Layouts/Section";
import SectionHeadline from "../typography/SectionHeadline";
import GradientText from "../typography/GradientText";
import { Link } from "../Link";


type RouteType = 'product' | 'doc';
const routeTypes: RouteType[] = ['product', 'doc'];

type TFeature = {
  name: string;
  description: string;
  productId?: string;
  id: string;
}

type FEATURE = TFeature & {
  route: (type: RouteType) => string;
}

enum ComponentArea {
  Input,
  Navigation,
  DataDisplay,
  Util,
  Hook,
}

type UserId = string;
type PackageId = string;

export type Owners = {
  componentAreas: Record<string, ComponentArea>;
  miscMaintainers?: Record<string, UserId[]>;
  packageOwners: Record<PackageId, UserId[]>;
  packageMaintainers: Record<PackageId, UserId[]>;
}

export type ProductCategoryId = 'null' | 'core' | 'services' | 'utility' | 'docs';

export interface Product {
  productId: string;
  product?: TProduct
}

export type TProduct = {
  id: string,
  metadata: string,
  category: ProductCategoryId,
  name: string;
  fullName: string;
  description: string;
  productMenu?: boolean;
  docsMenu?: boolean;
  swipeable?: boolean;
  owners: string[],
  maintainers?: string[];
  miscMaintainers?: Record<string, string[]>;
  componentAreas?: Record<string, ComponentArea>;
  icon: string;
  features: TFeature[];
  url: string;
  hideProductFeatures?: boolean;
  showcaseType: React.ComponentType;
  showcaseContent?: any;
};

type LinkType = 'product' | 'doc';
type SubMenuType = 'products' | 'docs' | null

export type ProductMenuTitleProps = {
  icon: React.ReactElement;
  name: React.ReactNode;
  description: React.ReactNode;
  chip?: React.ReactNode;
} & Omit<JSX.IntrinsicElements['div'], 'ref'>;

type ProductMenuItemProps = {
  currentProductId?: string,
  sx?: SxProps<Theme>
};

function getTypeUrl(type: LinkType) {
  return type === 'doc' ? '/docs/' : '/';
}

const OwnersDefault: Owners = {
  componentAreas: {},
  miscMaintainers: {} as Record<string, UserId[]>,
  packageMaintainers: {},
  packageOwners: {}
};

export class Product  {
  data: TProduct;

  routes: Record<string, string>;

  linkType?: LinkType;

  constructor(product: TProduct, routes: Record<string, string>, linkType?: LinkType) {
    this.linkType = linkType;
    this.data = product
    this.routes = routes;
  }

  get productRoutes(): { [key: string]: string } {
    const routes: { [key: string]: string } = {};
    routeTypes.forEach(type => {
      routes[type as string] = this.url(type);
    });
    return routes;
  }

  get showcaseType() {
    return this.data.showcaseType;
  }

  private getFeature(feature: TFeature): FEATURE {
    return {
      ...feature,
      route: (type: RouteType) => this.url(type, feature.id, feature.productId),
    };
  }

  get features(): FEATURE[] {
    return this.data.features.map(f => this.getFeature(f))
  }

  menuItem(type: SubMenuType, props: ProductMenuItemProps) {
    const { currentProductId, sx } = props;
    const product = type === 'products';
    const showFeatures = !(product && this.data.hideProductFeatures);
    return (
      <Box
        key={this.id}
        component="li"
        role="none"
        sx={(theme) => ({
          p: 2, pr: 3,
          '&:hover': {
            backgroundColor: 'grey.50',
          },
          ...theme.applyDarkStyles({
            '&:hover': {
              backgroundColor: alpha(theme.palette.primaryDark[700], 0.4),
            },
          }),
        })}
      >
        <Box
          component={Link}
          href={this.url(type === 'docs' ? 'doc' : 'product')}
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
          {this.icon}
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="text.primary" variant="body2" fontWeight="700">
              {this.name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {this.description}
            </Typography>
          </Box>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="flex-start"
          spacing={1}
          sx={{
            ml: '36px',
            pl: 2,
            pt: 1.5,
            position: 'relative',
            '& > .MuiChip-root': {
              position: 'initial',
              '&:hover': {
                '& .product-description': {
                  opacity: 1,
                },
              },
            },
          }}
        >
          {showFeatures && this.features.map((feature) => (
            <Chip
              key={feature.name}
              color={currentProductId === this.id ? 'primary' : undefined}
              variant={currentProductId === this.id ? 'filled' : 'outlined'}
              component={Link}
              href={this.url(type === 'docs' ? 'doc' : 'product', feature.id, feature.productId)}
              label={feature.name}
              clickable
              size="small"
            />
          ))}
        </Stack>
      </Box>
    );
  }

  subMenuItem() {
    return (
      <Box
        role={"menuitem"}
        sx={[
          {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          },
          // ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {this.icon}
        <Box sx={{ flexGrow: 1 }}>
          <Typography color="text.primary" sx={{ display: "flex", flexDirection: "row"}} variant="body2" fontWeight="700">
            {this.name}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {this.description}
          </Typography>
        </Box>
      </Box>
    )
  }

  selectorItem(selectedProductId: string) {
    return (
      <Box
        component="li"
        role="none"
        sx={{ p: 2, pr: 3}}
      >
        {this.subMenuItem()}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="flex-start"
          spacing={1}
          sx={{
            ml: '36px',
            pl: 2,
            pt: 1.5,
            position: 'relative',
            '& > .MuiChip-root': {
              position: 'initial',
              '&:hover': {
                '& .product-description': {
                  opacity: 1,
                },
              },
            },
          }}
        >
          {this.features.map((feature) => (
            <Chip
              key={feature.name}
              color={selectedProductId === this.id ? 'primary' : undefined}
              variant={selectedProductId === this.id ? 'filled' : 'outlined'}
              component={Link}
              href={feature.route?.('doc') ?? ''}
              label={feature.name}
              clickable
              size="small"
            />
          ))}
        </Stack>
      </Box>
    )
  }

  highlightedItem(selectedIndex: number, setSelectedIndex: React.Dispatch<React.SetStateAction<number>>, index: number, linkType?: LinkType, sx?: SxProps<Theme>) {
    return (<Highlighter
      key={this.id}
      disableBorder
      onClick={() => setSelectedIndex(index)}
      selected={selectedIndex === index}
      sx={sx}
    >
      {this.item(this.link(linkType))}
    </Highlighter>);
  }

  item(linkType: LinkType) {
    return (
      <Box
        component="span"
        sx={{
          display: 'flex',
          p: 2,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          gap: 2.5,
        }}
      >
        <span>{this.icon}</span>
        <span>
        <Typography
          component="span"
          color="text.primary"
          variant="body2"
          fontWeight="bold"
          display="block"
        >
          {this.name}
        </Typography>
        <Typography
          component="span"
          color="text.secondary"
          variant="body2"
          fontWeight="regular"
          display="block"
          sx={{ my: 0.5 }}
        >
          {this.description}
        </Typography>
        <Link
          href={this.route(linkType) ?? ''}
          color="primary"
          variant="body2"
          fontWeight="bold"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            '& > svg': { transition: '0.2s' },
            '&:hover > svg': { transform: 'translateX(2px)' },
          }}
          onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
            event.stopPropagation();
          }}
        >
          <span>Learn more</span>{' '}
          <Box component="span" sx={visuallyHidden}>
            by going to the {this.name} page
          </Box>
          <KeyboardArrowRightRounded fontSize="small" sx={{ mt: '1px', ml: '2px' }} />
        </Link>
      </span>
      </Box>
    );
  }

  url(type: LinkType, suffix: string = '', productId?: string) {
    if (productId) {
      return `/${productId}${getTypeUrl(type)}${suffix}`
    }
    return `${this.data.url}${getTypeUrl(type)}${suffix}`;
  }

  get id(): string {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get icon() {
    return <IconImage name={this.data.icon} />;
  }

  get docHref() {
    return this.routes[`${this.data.id}Docs`];
  }

  get href() {
    return this.routes[this.data.id];
  }

  private link(linkType?: LinkType) {
    return this.linkType ?? linkType ?? 'product';
  }

  route(linkType?: LinkType) {
    return this.link(linkType) ? this.href : this.docHref;
  }
}


class IndexObject<T> {
  index: { [key: string]: T } = {};

  constructor(key: string, inputArray: T[] = []) {
    inputArray.forEach((obj: T) => {
      const id = (obj[key as keyof T] as string);
      this.index[id] = obj
    });

    return new Proxy(this, {
      get: (target, property: string) => {
        if (property in target) {
          return target[property as keyof typeof target];
        }
        return target.index[property];
      },
      set: (target, property: string, value) => {
        if (property in target) {
          target[property as keyof typeof target] = value;
        } else {
          target.index[property] = value;
        }
        return true;
      }
    });
  }

  get keys() {
    return Object.keys(this.index);
  }

  get values() {
    return Object.values(this.index);
  }

  get entries() {
    return Object.entries(this.index);
  }
}

const SwipeableViews = dynamic(() => import('react-swipeable-views'), { ssr: false });

export type ProductsComponentProps = {
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}
export type ProductStackProps = ProductsComponentProps & {
  inView?: boolean;
}
type SetSubMenuOpen = React.Dispatch<React.SetStateAction<SubMenuType>>;
export type ProductMenuProps =  {
  products: Product[],
  type: SubMenuType,
  subMenuOpen?: SubMenuType,
  menuRef?: React.RefObject<HTMLButtonElement>,
  setSubMenuOpenUndebounce?:  (value: SubMenuType) => () => void,
  setSubMenuOpenDebounced?:  SetSubMenuOpen & Cancelable,
  setSubMenuOpen?: SetSubMenuOpen,
  handleClickMenu?: (value: SubMenuType) => () => void
} & ProductMenuItemProps;

function titleCase(str: string) {
  str = str.replace(/-/g, ' ');
  const result = str.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function SwipeableProducts(props: SwipeableProps) {
  const swipeableProducts = React.useMemo(() => {
    const { show, selectedIndex, setSelectedIndex, products } = props;
    return (
      <Box sx={{
        display: { md: 'none' },
        maxWidth: 'calc(100vw - 40px)',
        minHeight: { xs: 200, sm: 166 },
        '& > div': { pr: '32%' },
      }}
      >
        {(show) && (<SwipeableViews
          index={selectedIndex}
          resistance
          enableMouseEvents
          onChangeIndex={(index) => setSelectedIndex(index)}
        >
          {products.map((product: Product, index: number) => {
            return  product.highlightedItem(selectedIndex, setSelectedIndex, index, 'product', {
              width: '100%',
              transition: '0.3s',
              transform: selectedIndex !== index ? 'scale(0.9)' : 'scale(1)',
            });
          })}
        </SwipeableViews>)}
      </Box>
    )
  }, [props]);

  return swipeableProducts;
}

function ProductMenu(props: ProductMenuProps) {
  const menu = React.useMemo(() => {
    const {
      type,
      subMenuOpen,
      menuRef,
      setSubMenuOpenUndebounce,
      setSubMenuOpenDebounced,
      handleClickMenu,
    } = props;

    if (!type) {
      return null;
    }
    return <li
      onMouseEnter={setSubMenuOpenUndebounce?.(type)}
      onFocus={setSubMenuOpenUndebounce?.(type)}
      onMouseLeave={() => setSubMenuOpenDebounced?.(null)}
      onBlur={setSubMenuOpenUndebounce?.(null)}
    >
      <ButtonBase
        ref={menuRef}
        aria-haspopup
        aria-expanded={subMenuOpen === type ? 'true' : 'false'}
        onClick={handleClickMenu?.(type)}
        aria-controls={subMenuOpen === type ? 'products-popper' : undefined}
      >
        {titleCase(type)}
      </ButtonBase>
      <Popper
        id="products-popper"
        key={type}
        open={props.subMenuOpen === type}
        anchorEl={props.menuRef?.current}
        transition
        placement="bottom-start"
        style={{
          zIndex: 1200,
          pointerEvents: props.subMenuOpen === type ? undefined : 'none',
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={250} key={'fade'}>
            <Paper
              key={'someKey'}
              variant="outlined"
              sx={(theme) => ({
                mt: 1,
                minWidth: 498,
                overflow: 'hidden',
                borderColor: 'grey.200',
                bgcolor: 'background.paper',
                boxShadow: `0px 4px 16px ${alpha(theme.palette.grey[200], 0.8)}`,
                '& ul': {
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                },
                '& li:not(:last-of-type)': {
                  borderBottom: '1px solid',
                  borderColor: theme.palette.divider,
                },
                '& a': { textDecoration: 'none' },
                ...theme.applyDarkStyles({
                  borderColor: 'primaryDark.700',
                  bgcolor: 'primaryDark.900',
                  boxShadow: `0px 4px 16px ${alpha(theme.palette.common.black, 0.8)}`,
                  '& li:not(:last-of-type)': {
                    borderColor: 'primaryDark.700',
                  },
                }),
              })}
            >
              <ul>
                {props.products.map((product: Product) => {
                  return product.menuItem(type, props);
                })}
              </ul>
            </Paper>
          </Fade>
        )}
      </Popper>
    </li>
  }, [props, props.products]);
  return menu;
}

type ProductSwitcherProps = ProductStackProps & {
  products: Products;
}

export type SwipeableProps = ProductStackProps & {
  show: boolean;
  products: Product[];
}

function getSwipeableProducts(products: Product[]) {
  return products.filter(p => p.data.swipeable);
}

function ProductsSwitcher(props: ProductSwitcherProps) {
  const { inView = false, selectedIndex, setSelectedIndex, products } = props;
  const isBelowMd = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <React.Fragment>
      {products.swipeable({ show: isBelowMd && inView, selectedIndex, setSelectedIndex, products: getSwipeableProducts(products.products) } as SwipeableProps)}
      {products.stack(props)}
    </React.Fragment>
  );
}

function ProductsPreviews({ products }: { products: Products } ) {
  const swipeableProducts = getSwipeableProducts(products.products);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: '0px 200px',
  });
  const Showcase = swipeableProducts[selectedIndex]?.showcaseType;

  // const showcaseProps = { showcaseContent:
  // products.products?.[selectedIndex]?.data?.showcaseContent};
  return (
    <Section bg="gradient" ref={ref}>
      <Grid container spacing={0}>
        <Grid item md={6}>
          <SectionHeadline
            overline="Products"
            title={
              <Typography variant="h2">
                <GradientText>Bleeding edge</GradientText> media components with support provided by the creators.
              </Typography>
            }
            description="Build at an accelerated pace without sacrificing flexibility or control."
          />
          {products.switcher({ inView, selectedIndex, setSelectedIndex })}
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={selectedIndex === 0 ? { minHeight: { xs: 777, sm: 757, md: 'unset' } } : {}}
        >
          {inView ? (
            <React.Fragment>
              <Showcase  />
            </React.Fragment>
          ) : (
            <Box sx={{ height: { xs: 0, md: 803 } }} />
          )}
        </Grid>
      </Grid>
    </Section>
  );
}

export type AreaMaintainers = {
  inputs?: UserId[],
  dataDisplay?: UserId[],
  feedback?: UserId[],
  surfaces?: UserId[],
  navigation?: UserId[],
  layout?: UserId[],
  utils?: UserId[],
};

class Products extends IndexObject<Product> {

  static areaMaintainers: AreaMaintainers;

  static defaultMaintainer?: string;

  constructor(products: (TProduct | Product)[], routes: Record<string, string>, defaultMaintainer: string | undefined, areaMaintainers?: AreaMaintainers | undefined) {
    const baseInput = products.map((product) => {
      if (product instanceof Product) {
        return product;
      }
      return new Product(product, routes);
    });
    super('id',baseInput);
    Products.defaultMaintainer = defaultMaintainer;
    const defaultAreaMaintainers = {
      inputs: defaultMaintainer ? [defaultMaintainer] : [],
      dataDisplay: defaultMaintainer ? [defaultMaintainer] : [],
      feedback: defaultMaintainer ? [defaultMaintainer] : [],
      surfaces: defaultMaintainer ? [defaultMaintainer] : [],
      navigation: defaultMaintainer ? [defaultMaintainer] : [],
      layout: defaultMaintainer ? [defaultMaintainer] : [],
      utils: defaultMaintainer ? [defaultMaintainer] : [],
    };
    Products.areaMaintainers = { ...defaultAreaMaintainers, ...areaMaintainers };
  }

  get products() {
    return Object.values(this.index);
  }

  get publicPkg() {
    return this.index.length ? Object.values(this.index).filter(product => product?.data?.docsMenu) : [];
  }

  get pages() {
    return this.publicPkg.map(p => p.url('product'));
  }

  get productOwners(): Owners {

    return this.publicPkg.reduce((acc, product) => {
      acc.packageOwners[product.id] = product.data.owners;
      acc.packageMaintainers[product.id] = product.data.maintainers ?? product.data.owners;
      if (product.data.miscMaintainers) {
        if (acc.miscMaintainers) {
          Object.entries(product.data.miscMaintainers).forEach(([misc, maintainers])=> {
            acc.miscMaintainers![misc] = maintainers;
          })
        }
      }
      return acc;
    }, {...OwnersDefault, areaMaintainers: Products.areaMaintainers} as Owners);
  }

  public previews() {
    return <ProductsPreviews products={this} />;
  }

  public switcher(props: ProductStackProps) {
    return <ProductsSwitcher {...props} products={this} />;
  }

  public swipeable(props: SwipeableProps) {
    return <SwipeableProducts {...props} />
  }

  getFeatureUrl(productId: string, featureId: string, type: LinkType = 'doc') {
    const product = this.index[productId];
    const feature = product.features.find((f: FEATURE) => f.id === featureId);
    if ( !feature) {
      return '';
    }
    return product.url(type, feature.productId ?? feature.id);
  }

  productSelector(selectedProductId: string) {
    return (
      <React.Fragment>

        {this.products.map((product: Product) => {
          return  product.selectorItem(selectedProductId);
        })}
      </React.Fragment>
    )
  }

  menu(props: Omit<ProductMenuProps, 'products'> ) {
    const menuProps = { ...props, products: props.type === 'products' ? this.products.filter(p => p.data.productMenu) : this.products.filter(p => p.data.docsMenu) };
    return <ProductMenu { ...menuProps } />
  }

  stack(props: ProductStackProps) {
    const { selectedIndex, setSelectedIndex } = props;
    const swipableProducts = getSwipeableProducts(this.products);
    return (<Stack spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, maxWidth: 500 }}>
      {swipableProducts.map((product, index) => {
        return product.highlightedItem(selectedIndex, setSelectedIndex, index);
      })}
    </Stack>)
  }
}

export type MenuProps = {
  linkType: LinkType,
  sx?: SxProps<Theme>,
};

export default Products;
