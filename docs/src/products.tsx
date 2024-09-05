import { Products, Product, TProduct } from "@stoked-ui/docs";
import StokedConsultingShowcase from "./components/home/StokedConsultingShowcase";
import AdvancedShowcase from "./components/home/AdvancedShowcase";
import FileExplorerShowcase from './components/home/FileExplorerShowcase';
import TimelineShowcase from "./components/home/TimelineShowcase";
import EditorShowcase from './components/home/EditorShowcase';
import ROUTES from "./route";
import {pkgProducts} from "./modules/utils/getProductInfoFromUrl";

const stokedConsultingData: TProduct = {
  id: 'stoked-consulting',
  name: "Stoked Consulting",
  fullName: "Stoked Consulting Services",
  description: "Full stack consulting services.",
  icon: "product-designkits",
  metadata: 'Consulting',
  url: "/consulting",
  live: true,
  showcaseType: StokedConsultingShowcase,
  owners: ['brian-stoker'],
  features: [
    {
      name: 'Front End',
      description: 'UI design and development services.',
      id: 'front-end',
    }, {
      name: 'Backend',
      description: 'Backend architecture and development services.',
      id: 'backend',
    }, {
      name: 'Fullstack',
      description: 'Full stack development services.',
      id: 'fullstack',
    }
  ],
};

const stokedConsulting = new Product(stokedConsultingData, ROUTES);
const stokedUiData: TProduct = {
  id: 'stoked-ui',
  name: "Stoked UI",
  fullName: "Stoked UI",
  description: "Advanced media components MIT",
  icon: "product-designkits",
  metadata: 'Stoked UI',
  url: "/stoked-ui",
  owners: ['brian-stoker'],
  maintainers: ['brian-stoker'],
  miscMaintainers: {'/scripts/': ['brian-stoker']},
  showcaseType: StokedConsultingShowcase,
  hideProductFeatures: true,
  live: true,
  features: [{
    name: 'Introduction',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
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
const sui = new Product(stokedUiData, ROUTES);

const fileExplorerData: TProduct = pkgProducts['file-explorer'];
fileExplorerData.showcaseType = FileExplorerShowcase;
const fileExplorer = new Product(fileExplorerData, ROUTES);

const mediaSelectorData: TProduct = pkgProducts['media-selector'];
mediaSelectorData.showcaseType = AdvancedShowcase;
const mediaSelector = new Product(mediaSelectorData, ROUTES);

const timelineData: TProduct = pkgProducts.timeline;
timelineData.showcaseType = TimelineShowcase;
const timeline = new Product(timelineData, ROUTES);

const editorData: TProduct = pkgProducts.editor;
editorData.showcaseType = EditorShowcase;
const editor = new Product(editorData, ROUTES);

const PRODUCTS = new Products([fileExplorer, mediaSelector, timeline, editor, stokedConsulting], ROUTES);
const ALL_PRODUCTS = new Products([sui, stokedConsulting], ROUTES);
const ProductIds = Object.keys(ALL_PRODUCTS.index);

export type ProductId = typeof ProductIds[number];

export { PRODUCTS, ALL_PRODUCTS, ProductIds }

