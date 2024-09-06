import { Products, Product, TProduct, ProductsInfo } from "@stoked-ui/docs";
import StokedConsultingShowcase from "./components/home/StokedConsultingShowcase";
import AdvancedShowcase from "./components/home/AdvancedShowcase";
import FileExplorerShowcase from './components/home/FileExplorerShowcase';
import TimelineShowcase from "./components/home/TimelineShowcase";
import EditorShowcase from './components/home/EditorShowcase';
import ROUTES from "./route";

const stokedConsultingData: TProduct = {
  id: 'stoked-consulting',
  name: "Stoked Consulting",
  fullName: "Stoked Consulting Services",
  description: "Full stack consulting services.",
  metadata: "Consulting",
  category: "services",
  icon: "product-designkits",
  url: "/consulting",
  productMenu: true,
  docsMenu: false,
  swipeable: true,
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

const stokedUiData: TProduct = {
  id: 'stoked-ui',
  name: "Stoked UI",
  fullName: "Stoked UI",
  description: "Advanced media components MIT",
  icon: "product-designkits",
  metadata: 'Stoked UI',
  category: "docs",
  url: "/stoked-ui",
  owners: ['brian-stoker'],
  maintainers: ['brian-stoker'],
  miscMaintainers: {'/scripts/': ['brian-stoker']},
  showcaseType: StokedConsultingShowcase,
  productMenu: true,
  docsMenu: false,
  swipeable: false,
  features: [{
    name: 'Media Selector',
    description: 'Library used to select and gather type specific meta data from client side files',
    productId: 'media-selector',
    id: ''
  }, {
    name: 'File Explorer',
    description: 'Highly extensible file explorer component with drag and drop support.',
    productId: 'file-explorer',
    id: ''
  }, {
    name: 'Timeline',
    description: 'Timeline component used to construct tools that manipulate things over time.',
    productId: 'timeline',
    id: ''
  }, {
    name: 'Editor',
    description: 'Editor contains components intended for use as raw building blocks for tools that can edit.. THEM THANGS..',
    productId: 'editor',
    id: ''
  }],
};

export default function getProducts() {
  const stokedConsulting = new Product(stokedConsultingData, ROUTES);
  const sui = new Product(stokedUiData, ROUTES);
  const fileExplorer = new Product({...ProductsInfo['file-explorer'], showcaseType: FileExplorerShowcase}, ROUTES);
  const mediaSelector = new Product({...ProductsInfo['media-selector'], showcaseType: AdvancedShowcase,}, ROUTES);
  const timeline = new Product({...ProductsInfo.timeline, showcaseType: TimelineShowcase,}, ROUTES);
  const editor = new Product({...ProductsInfo.editor, showcaseType: EditorShowcase,}, ROUTES);
  return new Products([sui, mediaSelector, fileExplorer, timeline, editor, stokedConsulting], ROUTES, 'brian-stoker')
}

