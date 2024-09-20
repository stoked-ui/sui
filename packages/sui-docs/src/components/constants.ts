const CODE_VARIANTS = {
  JS: 'JS',
  TS: 'TS',
};

const CODE_STYLING = {
  SYSTEM: 'SUI System',
  TAILWIND: 'Tailwind',
  CSS: 'CSS',
};

// Valid languages to use in production
const LANGUAGES_LABEL: Array<any> = [
  {
    code: 'en',
    text: 'English',
  },
];

// The ratio of ads display sending event to Google Analytics
const GA_ADS_DISPLAY_RATIO = 0.1;

export {
  CODE_VARIANTS,
  LANGUAGES_LABEL,
  CODE_STYLING,
  GA_ADS_DISPLAY_RATIO,
};
