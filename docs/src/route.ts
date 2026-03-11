import { toAbsoluteSitePath } from 'docs/src/modules/utils/siteRouting';

type Routes = {
  [key: string]: string;
};

const ROUTES: Routes = {
  stokedUi: toAbsoluteSitePath('stoked-ui', '/stoked-ui/'),
  fileExplorer: '/stoked-ui/file-explorer/',

  media: '/media/',
  mediaDocs: '/media/docs/overview/',
  common: '/common/',
  commonDocs: '/common/docs/overview/',
  mediaApi: '/media-api/',
  mediaApiDocs: '/media-api/docs/overview/',
  videoValidator: '/video-validator/',
  videoValidatorDocs: '/video-validator/docs/overview/',
  suiFileExplorerOverviewDoc: '/material-ui/overview',
  // Marketing pagesHeaderNavBar
  productCore: '/core/',
  productMaterial: '/material-ui/',
  productBase: '/base-ui/',
  productAdvanced: '/x/',
  productToolpad: '/toolpad/',
  productTemplates: '/templates/',
  productDesignKits: '/design-kits/',
  careers: '/careers/',
  pricing: '/pricing/',
  about: '/about/',
  blog: '/blog/',
  // Flux
  flux: '/flux/',
  fluxDocs: '/flux/docs/overview/',
  // Mac Mixer
  macMixer: '/mac-mixer/',
  macMixerDocs: '/mac-mixer/docs/overview/',
  // Always Listening
  alwaysListening: '/always-listening/',
  alwaysListeningDocs: '/always-listening/docs/overview/',
  // Stokd Cloud
  stokdCloud: '/stokd-cloud/',
  stokdCloudDocs: '/stokd-cloud/docs/overview/',
  // Consulting
  home: '/file-explorer/',
  consulting: toAbsoluteSitePath('consulting', '/consulting/'),
  consultingAdmin: toAbsoluteSitePath('consulting', '/consulting/admin/'),
  consultingClients: toAbsoluteSitePath('consulting', '/consulting/clients/'),
  consultingCustomer: toAbsoluteSitePath('consulting', '/consulting/customer/'),
  consultingGroupies: toAbsoluteSitePath('consulting', '/consulting/groupies/'),
  consultingPartners: toAbsoluteSitePath('consulting', '/consulting/partners/'),
  consultingFrontEnd: toAbsoluteSitePath('consulting', '/consulting/front-end/'),
  consultingBackEnd: toAbsoluteSitePath('consulting', '/consulting/back-end/'),
  consultingDevops: toAbsoluteSitePath('consulting', '/consulting/devops/'),
  consultingAi: toAbsoluteSitePath('consulting', '/consulting/ai/'),
  // SUI doc pages
  suiCoreDocs: '/sui/',
  suiXDocs: '/sui-x/',
  // SUI core
  suiCoreFileList: '/sui/file-list/',
  suiCoreFileListDoc: '/sui/docs/file-list/',
  suiCoreTimeline: '/sui/timeline/',
  suiCoreTimelineDoc: '/sui/docs/timeline/',
  suiCoreEditor: '/sui/editor/',
  suiCoreEditorDoc: '/sui/editor/',
  suiCoreMediaProvider: '/sui/media-provider/',
  suiCoreMediaProviderDoc: '/sui/docs/media-provider/',
  // SUI core components
  suiXFileList: '/sui-x/file-list/',
  suiXTimeline: '/sui-x/timeline/',
  suiXEditor: '/sui-x/editor/',
  suiXMediaProvider: '/sui-x/media-provider/',
  // Stoked UI doc pages
  materialDocs: 'https://stokedconsulting.com/material-ui/getting-started/',
  materialIcons: '/material-ui/material-icons/',
  freeTemplates: '/material-ui/getting-started/templates/',
  components: '/material-ui/getting-started/supported-components/',
  customization: '/material-ui/customization/how-to-customize/',
  theming: '/material-ui/customization/theming/',
  documentation: toAbsoluteSitePath('stoked-ui', '/stoked-ui/docs/overview/'),
  communityHelp: '/material-ui/getting-started/support/#community-help-free',
  showcase: '/material-ui/discover-more/showcase/',
  coreRoadmap: 'https://github.com/orgs/stoked-ui/projects/1',
  vision: '/material-ui/discover-more/vision/',
  support: toAbsoluteSitePath('stoked-ui', '/stoked-ui/docs/support/#direct-support'),
  goldSponsor: '/material-ui/discover-more/backers/#gold-sponsors',
  // Base UI doc pages
  baseDocs: 'https://stokedconsulting.com/base-ui/getting-started/',
  baseComponents: '/base-ui/all-components/',
  baseQuickstart: '/base-ui/getting-started/quickstart/',
  // Joy UI doc pages
  joyDocs: '/joy-ui/getting-started/',
  // System pages
  systemDocs: 'https://stokedconsulting.com/system/getting-started/',
  // X general pages
  xIntro: 'https://stokedconsulting.com/x/introduction/',
  xRoadmap: 'https://github.com/mui/mui-x/projects/1',
  xLicensing: '/x/introduction/licensing/',
  // Data Grid doc pages
  dataGridOverview: '/x/react-data-grid/',
  dataGridDocs: '/x/react-data-grid/getting-started/',
  dataGridFeatures: '/x/react-data-grid/#features',
  dataGridFeaturesComparison: '/x/react-data-grid/getting-started/#feature-comparison',
  // Date and Time Pickers doc pages
  datePickersOverview: '/x/react-date-pickers/',
  // Charts doc pages
  chartsOverview: '/x/react-charts/',
  // File Explorer doc pages
  treeViewOverview: '/x/react-tree-view/',
  // Toolpad pages
  toolpadDocs: '/toolpad/studio/getting-started/',
  toolpadStudioDocs: '/toolpad/studio/getting-started',
  // External pages
  rssFeed: '/feed/blog/rss.xml',
  handbook: 'https://mui-org.notion.site/Handbook-f086d47e10794d5e839aef9dc67f324b',
  privacyPolicy: '/legal/privacy/',
  store: 'https://stokedconsulting.com/store/',
};

export default ROUTES;
