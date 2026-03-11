import * as React from "react";
import ButtonBase from "@mui/material/ButtonBase";
import { Cancelable } from "@mui/utils/debounce";
import { SxProps } from "@mui/system";
// import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
// import KeyboardArrowRightRounded from "@mui/material/SvgIcon/SvgIcon";
import { Link } from "@stoked-ui/docs";
import { alpha, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import dynamic from "next/dynamic";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useInView } from "react-intersection-observer";
import Grid from "@mui/material/Grid";
import { getApiUrl } from "./modules/utils/getApiUrl";
import PageContext from "./modules/components/PageContext";
import IconImage from "./components/icon/IconImage";
import ROUTES from './route';
import Highlighter from "./components/action/Highlighter";
import Section from "./layouts/Section";
import SectionHeadline from "./components/typography/SectionHeadline";
import GradientText from "./components/typography/GradientText";
import StokedConsultingShowcase from "./components/home/StokedConsultingShowcase";
import AdvancedShowcase from "./components/home/AdvancedShowcase";
import FileExplorerShowcase from './components/home/FileExplorerShowcase';
import { inferSiteForProductId, PublicSite, toAbsoluteSitePath } from "./modules/utils/siteRouting";

import TimelineShowcase from "./components/home/TimelineShowcase";
import EditorShowcase from './components/home/EditorShowcase';
import NoSsr from "@mui/material/NoSsr";

type RouteType = 'product' | 'doc';
const routeTypes: RouteType[] = ['product', 'doc'];

type PageContextType = typeof PageContext;

type TFeature = {
  name: string;
  description: string;
  productId?: string;
  id: string;
}

type FEATURE = TFeature & {
  route: (type: RouteType) => string;
}

export type TProduct = {
  id: string,
  name: string;
  fullName: string;
  description: string;
  icon: string;
  features: TFeature[];
  url: string;
  site?: PublicSite;
  hideProductFeatures?: boolean;
  live?: boolean;
  showcaseType: React.ComponentType;
  showcaseContent?: any;
}

type LinkType = 'product' | 'doc';
type SubMenuType = 'products' | 'docs' | 'consulting' | null

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

function normalizeProductSuffix(type: LinkType, suffix: string) {
  if (type === 'product' && (!suffix || suffix === 'overview')) {
    return '';
  }
  return suffix;
}

export class Product {
  data: TProduct;

  linkType?: LinkType;

  constructor(product: TProduct, linkType?: LinkType) {
    this.linkType = linkType;
    this.data = product;
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

  selectorItem(context: any) {
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
              color={context.productId === this.id ? 'primary' : undefined}
              variant={context.productId === this.id ? 'filled' : 'outlined'}
              component={Link}
              href={feature.route?.('product') ?? ''}
              label={feature.name}
              clickable
              size="small"
            />
          ))}
        </Stack>
      </Box>
    )
  }

  highlightedItem(productIndex: number, setProductIndex: React.Dispatch<React.SetStateAction<number>>, index: number, linkType?: LinkType, sx?: SxProps<Theme>) {
    return (<Highlighter
      key={this.id}
      disableBorder
      onClick={() => setProductIndex(index)}
      selected={productIndex === index}
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
      </span>
      </Box>
    );
  }

  url(type: LinkType, suffix: string = '', productId?: string) {
    const normalizedSuffix = normalizeProductSuffix(type, suffix);
    if (productId) {
      return toAbsoluteSitePath(
        inferSiteForProductId(productId),
        `/${productId}${getTypeUrl(type)}${normalizedSuffix}`,
      );
    }
    return toAbsoluteSitePath(
      this.data.site ?? inferSiteForProductId(this.data.id),
      `${this.data.url}${getTypeUrl(type)}${normalizedSuffix}`,
    );
  }

  get id() {
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
    return ROUTES[`${this.data.id}Docs`];
  }

  get href() {
    return ROUTES[this.data.id];
  }

  private link(linkType?: LinkType) {
    return this.linkType ?? linkType ?? 'product';
  }

  route(linkType?: LinkType) {
    return this.link(linkType) ? this.href : this.docHref;
  }
}


export type ProductSwipeableProps = ProductsComponentProps & {
  show: boolean;
  products: Products;
}

class IndexObject<T> {
  index: { [key: string]: T } = {};

  constructor(key: string, inputArray: T[] = [],) {
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
  productIndex: number;
  setProductIndex: React.Dispatch<React.SetStateAction<number>>;
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

function SwipeableProducts(props: ProductSwipeableProps) {
  const swipeableProducts = React.useMemo(() => {
    const { show, products, productIndex, setProductIndex } = props;
    const blocked = false;
    return (
      <Box sx={{
        display: { md: 'none' },
        maxWidth: 'calc(100vw - 40px)',
        minHeight: { xs: 200, sm: 166 },
        '& > div': { pr: '32%' },
      }}
      >
        {(show && !blocked) && (<SwipeableViews
          index={productIndex}
          resistance
          enableMouseEvents
          onChangeIndex={(index) => setProductIndex(index)}
        >
          {products.live.map((product: Product, index: number) => {
            return  product.highlightedItem(productIndex, setProductIndex, index, 'product', {
              width: '100%',
              transition: '0.3s',
              transform: productIndex !== index ? 'scale(0.9)' : 'scale(1)',
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
      products
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
        aria-controls={subMenuOpen === type ? `${type}-popper` : undefined}
      >
        {titleCase(type)}
      </ButtonBase>
      <Popper
        id={`${type}-popper`}
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
                {products.map((product: Product) => {
                  return product.menuItem(type, props);
                })}
              </ul>
            </Paper>
          </Fade>
        )}
      </Popper>
    </li>
  }, [props]);
  return menu;
}

type ProductSwitcherProps = ProductStackProps & {
  products: Products;
}

function ProductsSwitcher(props: ProductSwitcherProps) {
  const { inView = false, productIndex, setProductIndex, products } = props;
  const isBelowMd = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <React.Fragment>
      {products.swipeable({ show: isBelowMd && inView, productIndex, setProductIndex } as ProductSwipeableProps)}
      {products.stack(props)}
    </React.Fragment>
  );
}

function ProductsPreviews({ products }: { products: Products } ) {
  const [productIndex, setProductIndex] = React.useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: '0px 200px',
  });
  const Showcase = products.live[productIndex].showcaseType;

  // const showcaseProps = { showcaseContent: products.products?.[productIndex]?.data?.showcaseContent};
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
          {products.switcher({ inView, productIndex, setProductIndex })}
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={productIndex === 0 ? { minHeight: { xs: 777, sm: 757, md: 'unset', borderColor: 'red' } } : {}}
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


class Products extends IndexObject<Product> {

  constructor(products: (TProduct | Product)[] = []) {
    const baseInput = products.map((product) => {
      if (product instanceof Product) {
        return product;
      }
      return new Product(product);
    });
     super('id',baseInput);
  }

  get products() {
    return Object.values(this.index);
  }

  get live() {
    return Object.values(this.index).filter(product => product.data.live);
  }

  get pages() {
    return this.live.map(p => p.url('product'));
  }

  public previews() {
    return <NoSsr><ProductsPreviews products={this} /></NoSsr>;
  }

  public switcher(props: ProductStackProps) {
    return <ProductsSwitcher {...props} products={this} />;
  }

  public swipeable(props: ProductSwipeableProps) {
    return <SwipeableProducts {...props} products={this} />
  }

  getFeatureUrl(productId: string, featureId: string, type: LinkType = 'doc') {
    const product = this.index[productId];
    const feature = product.features.find((f: FEATURE) => f.id === featureId);
    if ( !feature) {
      return '';
    }
    return product.url(type, feature.productId ?? feature.id);
  }

  productSelector(context: PageContextType) {
    return (
      <React.Fragment>

          {this.live.map((product: Product) => {
            return  product.selectorItem(context);
          })}
      </React.Fragment>
    )
  }

  menu(props: Omit<ProductMenuProps, 'products'> ) {
    const menuProps = { ...props, products: this.live };
    return <ProductMenu { ...menuProps } />
  }

  stack(props: ProductStackProps) {
    const { productIndex, setProductIndex } = props;
    return (<Stack spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, maxWidth: 500 }}>
      {this.live.map((product, index) => {
        return product.highlightedItem(productIndex, setProductIndex, index);
      })}
    </Stack>)
  }
}

const consultingFrontEndData: TProduct = {
  id: 'consulting-front-end',
  name: "Front End",
  fullName: "Front End Consulting",
  description: "Modern UI design and development with React, Next.js, Angular, and TypeScript.",
  icon: "product-core",
  url: "/consulting/front-end",
  site: 'consulting',
  live: true,
  showcaseType: StokedConsultingShowcase,
  features: [],
};
const consultingFrontEnd = new Product(consultingFrontEndData);

const consultingBackEndData: TProduct = {
  id: 'consulting-back-end',
  name: "Back End",
  fullName: "Back End Consulting",
  description: "Scalable server architecture with Node.js, NestJS, Python, and cloud-native APIs.",
  icon: "product-advanced",
  url: "/consulting/back-end",
  site: 'consulting',
  live: true,
  showcaseType: StokedConsultingShowcase,
  features: [],
};
const consultingBackEnd = new Product(consultingBackEndData);

const consultingDevopsData: TProduct = {
  id: 'consulting-devops',
  name: "Devops",
  fullName: "Devops Consulting",
  description: "Cloud infrastructure with AWS, GCP, Terraform, and modern CI/CD pipelines.",
  icon: "product-toolpad",
  url: "/consulting/devops",
  site: 'consulting',
  live: true,
  showcaseType: StokedConsultingShowcase,
  features: [],
};
const consultingDevops = new Product(consultingDevopsData);

const consultingAiData: TProduct = {
  id: 'consulting-ai',
  name: "AI",
  fullName: "AI Consulting",
  description: "AI integration, ML pipelines, and LLM-powered applications for your business.",
  icon: "product-templates",
  url: "/consulting/ai",
  site: 'consulting',
  live: true,
  showcaseType: StokedConsultingShowcase,
  features: [],
};
const consultingAi = new Product(consultingAiData);
const stokedUiData: TProduct = {
  id: 'stoked-ui',
  name: "Stoked UI",
  fullName: "Stoked UI",
  description: "Advanced media components",
  icon: "product-designkits",
  url: "/stoked-ui",
  site: 'stoked-ui',
  showcaseType: StokedConsultingShowcase,
  live: true,
  features: [{
    name: 'Media',
    description: 'Comprehensive media management and component library for React.',
    productId: 'media',
    id: 'overview',
  }, {
    name: 'File Explorer',
    description: 'Highly extensible file explorer component with drag and drop support.',
    productId: 'file-explorer',
    id: 'overview',
  }, {
    name: 'Timeline',
    description: 'Timeline component used to construct tools that manipulate things over time.',
    productId: 'timeline',
    id: 'overview',
  }, {
    name: 'Editor',
    description: 'Editor contains components intended for use as raw building blocks for tools that can edit.. THEM THANGS..',
    productId: 'editor',
    id: 'overview',
  }],
};

const sui = new Product(stokedUiData);
const fileExplorerData: TProduct = {
  id: 'file-explorer',
  name: "File Explorer",
  fullName: "Stoked UI: File Explorer",
  description: "Advanced media components",
  icon: "product-core",
  url: "/file-explorer",
  site: 'stoked-ui',
  hideProductFeatures: true,
  live: true,
  showcaseType: FileExplorerShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
    id: 'overview',
  }, {
    name: 'File Explorer Basic',
    description: 'Library used to select and automatically pull appropriate meta data from client side files',
    id: 'file-explorer-basic/items',
  }, {
    name: 'File Explorer',
    description: 'Highly extensible file explorer component with drag and drop support.',
    id: 'file-explorer/items',
  }, {
    name: 'Roadmap',
    description: 'See what\'s next',
    id: 'roadmap',
  }],
};
const fileExplorer = new Product(fileExplorerData);


/* const coreData: TProduct = {
  id: 'core',
  name: "Core",
  fullName: "Stoked UI: Core",
  description: "Stoked UI is an open-source React component library that implements Google's Material Design. It's comprehensive and can be used in production out of the box.",
  icon: "product-advanced",
  url: "/core",
  hideProductFeatures: true,
  live: true,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
    id: 'overview',
  }, {
    name: 'MediaFile',
    description: 'Library used to select and automatically pull appropriate meta data from client side files',
    id: 'file-with-path',
  }, {
    name: 'IdGenerator',
    description: 'Highly extensible file explorer component with drag and drop support.',
    id: 'id-generator',
  }, {
    name: 'Roadmap',
    description: 'What&apos;s next',
    id: 'roadmap',
  }],
};
const core = new Product(coreData); */

const mediaData: TProduct = {
  id: 'media',
  name: "Media",
  fullName: "Stoked UI: Media",
  description: "Comprehensive media management and component library for React",
  icon: "product-advanced",
  url: "/media",
  site: 'stoked-ui',
  hideProductFeatures: true,
  live: true,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview, installation, and getting started',
    id: 'overview',
  }, {
    name: 'MediaViewer',
    description: 'Full-screen media viewing component with playback controls',
    id: 'media-viewer',
  }, {
    name: 'MediaCard',
    description: 'Card component for displaying media items with thumbnails',
    id: 'media-card',
  }, {
    name: 'Roadmap',
    description: 'What\'s next',
    id: 'roadmap',
  }],
};
const media = new Product(mediaData);

const commonData: TProduct = {
  id: 'common',
  name: "Common",
  fullName: "Stoked UI: Common",
  description: "Shared utilities, hooks, and components for Stoked UI",
  icon: "product-core",
  url: "/common",
  site: 'stoked-ui',
  hideProductFeatures: true,
  live: false,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview of shared utilities',
    id: 'overview',
  }, {
    name: 'Usage',
    description: 'How to use common utilities',
    id: 'usage',
  }, {
    name: 'Roadmap',
    description: 'What\'s next',
    id: 'roadmap',
  }],
};
const common = new Product(commonData);

const mediaApiData: TProduct = {
  id: 'media-api',
  name: "Media API",
  fullName: "Stoked UI: Media API",
  description: "Production-ready NestJS API for media management",
  icon: "product-advanced",
  url: "/media-api",
  site: 'stoked-ui',
  hideProductFeatures: true,
  live: false,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Architecture and features',
    id: 'overview',
  }, {
    name: 'Quick Start',
    description: 'Setup and first request',
    id: 'quick-start',
  }, {
    name: 'Roadmap',
    description: 'What\'s next',
    id: 'roadmap',
  }],
};
const mediaApi = new Product(mediaApiData);


const mediaSelectorData: TProduct = {
  id: 'media-selector',
  name: "Media Selector (Deprecated)",
  fullName: "Stoked UI: Media Selector",
  description: "Deprecated — use @stoked-ui/media instead",
  icon: "product-advanced",
  url: "/media-selector",
  site: 'stoked-ui',
  hideProductFeatures: true,
  live: false,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview (deprecated)',
    id: 'overview',
  }, {
    name: 'MediaFile',
    description: 'Library used to select and automatically pull appropriate meta data from client side files',
    id: 'file-with-path',
  }, {
    name: 'IdGenerator',
    description: 'Highly extensible file explorer component with drag and drop support.',
    id: 'id-generator',
  }, {
    name: 'Roadmap',
    description: 'What&apos;s next',
    id: 'roadmap',
  }],
};
const mediaSelector = new Product(mediaSelectorData);

const timelineData: TProduct = {
  id: 'timeline',
  name: "Timeline",
  fullName: "Stoked UI: Timeline",
  description: "Timeline component used to construct tools that manipulate things over time",
  icon: "product-toolpad",
  url: "/timeline",
  site: 'stoked-ui',
  hideProductFeatures: true,
  live: true,
  showcaseType: TimelineShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
    id: 'overview',
  }, {
    name: 'Timeline',
    description: 'Component useful in creating components capable of editing something over time or at key frames',
    id: 'timeline',
  },
  /*
     {
    name: 'Timeline Engine',
    description: 'Main game loop',
    id: 'timeline-engine',
  }, {
    name: 'Timeline Action',
    description: 'I&apos;m Jack&apos;s complete lack of surprise.',
    id: 'timeline-action',
  }
  */],
};
const timeline = new Product(timelineData);
const videoEditorData: TProduct = {
  id: 'editor',
  name: "Editor",
  fullName: "Stoked UI: Editor",
  description: "The Editor component is an open source client side video editor.",
  icon: "product-templates",
  url: "/editor",
  site: 'stoked-ui',
  hideProductFeatures: true,
  live: true,
  showcaseType: EditorShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
    id: 'overview',
  }, {
    name: 'Editor',
    description: 'Library used to select and automatically pull appropriate meta data from client side files',
    id: 'editor',
  }],
};

/*
{
 name: 'File Explorer',
 description: 'Highly extensible file explorer component with drag and drop support.',
 id: 'file-explorer',
 }, {
 name: 'Customization',
 description: 'Customize the file explorer.',
 id: 'file-explorer/file-explorer/customization',
 }
 */

const videoEditor = new Product(videoEditorData);

const fluxData: TProduct = {
  id: 'flux',
  name: "Flux",
  fullName: "Flux",
  description: "Make any website your Mac desktop wallpaper",
  icon: "product-toolpad",
  url: "/flux",
  site: 'consulting',
  hideProductFeatures: true,
  live: true,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Features and getting started',
    id: 'overview',
  }, {
    name: 'Websites',
    description: 'Managing websites, multi-monitor, browsing mode, and customization',
    id: 'websites',
  }, {
    name: 'Scripting',
    description: 'URL schemes, Shortcuts, and JavaScript API',
    id: 'scripting',
  }, {
    name: 'Roadmap',
    description: 'What\'s next',
    id: 'roadmap',
  }],
};
const flux = new Product(fluxData);

const macMixerData: TProduct = {
  id: 'mac-mixer',
  name: "Mac Mixer",
  fullName: "Mac Mixer",
  description: "macOS audio utility with per-app volume control, auto-pause, and system audio recording",
  icon: "product-advanced",
  url: "/mac-mixer",
  site: 'consulting',
  hideProductFeatures: true,
  live: true,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Features, system requirements, and getting started',
    id: 'overview',
  }, {
    name: 'App Volumes',
    description: 'Per-application volume control with boost',
    id: 'app-volumes',
  }, {
    name: 'Auto-Pause',
    description: 'Automatically pause music when other audio plays',
    id: 'auto-pause',
  }, {
    name: 'Roadmap',
    description: 'Current status and future plans',
    id: 'roadmap',
  }],
};
const macMixer = new Product(macMixerData);

const alwaysListeningData: TProduct = {
  id: 'always-listening',
  name: "Always Listening",
  fullName: "Always Listening",
  description: "Cross-platform voice pipeline tray app with Voice-to-Claude, Dictation, and Combined modes",
  icon: "product-templates",
  url: "/always-listening",
  site: 'consulting',
  hideProductFeatures: true,
  live: true,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Voice pipeline overview and tech stack',
    id: 'overview',
  }, {
    name: 'Voice Modes',
    description: 'Voice-to-Claude, Dictation, and Combined mode details',
    id: 'voice-modes',
  }, {
    name: 'Preferences',
    description: 'Configuration, hotkeys, and TTS settings',
    id: 'preferences',
  }, {
    name: 'Roadmap',
    description: 'Development status and planned features',
    id: 'roadmap',
  }],
};
const alwaysListening = new Product(alwaysListeningData);

const stokdCloudData: TProduct = {
  id: 'stokd-cloud',
  name: "Stokd Cloud",
  fullName: "Stokd Cloud",
  description: "AI-powered project orchestration with VSCode extension, NestJS API, and MCP server",
  icon: "product-toolpad",
  url: "/stokd-cloud",
  site: 'consulting',
  hideProductFeatures: true,
  live: true,
  showcaseType: AdvancedShowcase,
  features: [{
    name: 'Overview',
    description: 'Platform overview and architecture',
    id: 'overview',
  }, {
    name: 'VSCode Extension',
    description: 'Project management and Claude AI integration',
    id: 'vscode-extension',
  }, {
    name: 'State API',
    description: 'NestJS session and task tracking API',
    id: 'state-api',
  }, {
    name: 'Roadmap',
    description: 'Development status and plans',
    id: 'roadmap',
  }],
};
const stokdCloud = new Product(stokdCloudData);

const PRODUCTS: Products = new Products([fileExplorer, media, timeline, videoEditor]);
const ALL_PRODUCTS: Products = new Products([sui]);
const CONSULTING: Products = new Products([consultingFrontEnd, consultingBackEnd, consultingDevops, consultingAi]);
const ALL_PACKAGES: Products = new Products([
  fileExplorer, media, common, mediaApi, mediaSelector, timeline, videoEditor, flux,
  macMixer, alwaysListening, stokdCloud,
  consultingFrontEnd, consultingBackEnd, consultingDevops, consultingAi
]);

export type MenuProps = {
  linkType: LinkType,
  sx?: SxProps<Theme>,
};

function useAllProducts(): Products {
  const [products, setProducts] = React.useState<Products>(ALL_PRODUCTS);

  React.useEffect(() => {
    fetch(getApiUrl('/api/products/public'))
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const apiProducts = data.map(
          (p: any) =>
            new Product({
              id: p.productId,
              name: p.name,
              fullName: p.name,
              description: p.description,
              icon: p.icon || 'product-core',
              url: p.url,
              site: inferSiteForProductId(p.productId),
              features: p.features || [],
              hideProductFeatures: p.hideProductFeatures,
              live: true,
              showcaseType: AdvancedShowcase,
            }),
        );
        setProducts(new Products([sui, ...apiProducts]));
      })
      .catch(() => {});
  }, []);

  return products;
}

export { PRODUCTS, ALL_PRODUCTS, ALL_PACKAGES, CONSULTING, useAllProducts }
