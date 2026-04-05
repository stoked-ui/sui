export type LegalLocale = 'en' | 'de' | 'fr' | 'ja' | 'zh' | 'ko' | 'pt-br' | 'es';

export type PrivacyPolicyLocale = LegalLocale;
export type TermsLocale = LegalLocale;

export type PrivacyPolicyLocalizedContent = Partial<Record<LegalLocale, string>>;
export type TermsLocalizedContent = Partial<Record<LegalLocale, string>>;

type PrivacyPolicyLocaleOption = {
  code: PrivacyPolicyLocale;
  label: string;
  queryValue: string;
  aliases: readonly string[];
};

export const DEFAULT_PRIVACY_POLICY_LOCALE: PrivacyPolicyLocale = 'en';

export const PRIVACY_POLICY_LOCALES: readonly PrivacyPolicyLocaleOption[] = [
  {
    code: 'en',
    label: 'English (U.S.)',
    queryValue: 'en',
    aliases: ['en', 'en-us', 'en_us'],
  },
  {
    code: 'de',
    label: 'German',
    queryValue: 'de',
    aliases: ['de', 'de-de', 'de_de'],
  },
  {
    code: 'fr',
    label: 'French',
    queryValue: 'fr',
    aliases: ['fr', 'fr-fr', 'fr_fr'],
  },
  {
    code: 'ja',
    label: 'Japanese',
    queryValue: 'ja',
    aliases: ['ja', 'ja-jp', 'ja_jp'],
  },
  {
    code: 'zh',
    label: 'Chinese (Simplified)',
    queryValue: 'zh',
    aliases: ['zh', 'zh-cn', 'zh_cn', 'zh-hans', 'zh_hans', 'zh-hans-cn', 'zh_hans_cn'],
  },
  {
    code: 'ko',
    label: 'Korean',
    queryValue: 'ko',
    aliases: ['ko', 'ko-kr', 'ko_kr'],
  },
  {
    code: 'pt-br',
    label: 'Portuguese (Brazil)',
    queryValue: 'pt-br',
    aliases: ['pt', 'pt-br', 'pt_br', 'pt-brazil'],
  },
  {
    code: 'es',
    label: 'Spanish (Spain)',
    queryValue: 'es',
    aliases: ['es', 'es-es', 'es_es'],
  },
];

export const TRANSLATABLE_PRIVACY_POLICY_LOCALES = PRIVACY_POLICY_LOCALES.filter(
  (locale) => locale.code !== DEFAULT_PRIVACY_POLICY_LOCALE,
);

const PRIVACY_POLICY_LOCALE_LOOKUP = PRIVACY_POLICY_LOCALES.reduce<Record<string, PrivacyPolicyLocale>>(
  (lookup, locale) => {
    locale.aliases.forEach((alias) => {
      lookup[alias] = locale.code;
    });
    return lookup;
  },
  {},
);

function normalizePrivacyLocaleKey(value: string) {
  return value.trim().toLowerCase().replace(/_/g, '-');
}

export function normalizePrivacyPolicyLocale(value: unknown): PrivacyPolicyLocale {
  if (typeof value !== 'string') {
    return DEFAULT_PRIVACY_POLICY_LOCALE;
  }

  const normalizedValue = normalizePrivacyLocaleKey(value);

  return PRIVACY_POLICY_LOCALE_LOOKUP[normalizedValue] || DEFAULT_PRIVACY_POLICY_LOCALE;
}

export function sanitizePrivacyPolicyLocalizedContent(input: unknown): PrivacyPolicyLocalizedContent {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const localizedContent: PrivacyPolicyLocalizedContent = {};

  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    if (typeof value !== 'string' || !value.trim()) {
      return;
    }

    const locale = normalizePrivacyPolicyLocale(key);
    if (locale === DEFAULT_PRIVACY_POLICY_LOCALE) {
      return;
    }

    localizedContent[locale] = value;
  });

  return localizedContent;
}

export function resolveTermsContent(
  content: string | undefined,
  localizedContent: unknown,
  requestedLocale: unknown,
) {
  return resolvePrivacyPolicyContent(content, localizedContent, requestedLocale);
}

export function resolvePrivacyPolicyContent(
  content: string | undefined,
  localizedContent: unknown,
  requestedLocale: unknown,
) {
  const language = normalizePrivacyPolicyLocale(requestedLocale);
  const translations = sanitizePrivacyPolicyLocalizedContent(localizedContent);
  const fallbackContent = typeof content === 'string' ? content : '';
  const translatedContent =
    language === DEFAULT_PRIVACY_POLICY_LOCALE ? fallbackContent : translations[language];

  return {
    availableLanguages: [
      DEFAULT_PRIVACY_POLICY_LOCALE,
      ...TRANSLATABLE_PRIVACY_POLICY_LOCALES
        .map((locale) => locale.code)
        .filter((locale) => Boolean(translations[locale])),
    ],
    content: translatedContent || fallbackContent,
    fallbackToDefault:
      language !== DEFAULT_PRIVACY_POLICY_LOCALE && !translatedContent,
    language,
  };
}
