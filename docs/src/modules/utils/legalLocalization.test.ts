import { expect } from 'chai';
import {
  resolvePrivacyPolicyContent,
  sanitizePrivacyPolicyLocalizedContent,
  normalizePrivacyPolicyLocale,
} from './legalLocalization.ts';

describe('legalLocalization', () => {
  it('normalizes supported locale aliases', () => {
    expect(normalizePrivacyPolicyLocale('en-US')).to.equal('en');
    expect(normalizePrivacyPolicyLocale('de-DE')).to.equal('de');
    expect(normalizePrivacyPolicyLocale('zh-CN')).to.equal('zh');
    expect(normalizePrivacyPolicyLocale('pt_BR')).to.equal('pt-br');
    expect(normalizePrivacyPolicyLocale('es-ES')).to.equal('es');
  });

  it('sanitizes localized privacy policy content', () => {
    expect(
      sanitizePrivacyPolicyLocalizedContent({
        de: '# Datenschutz',
        'fr-FR': '# Confidentialite',
        en: '# English duplicate',
        unsupported: '# Ignore me',
        ko: '   ',
      }),
    ).to.deep.equal({
      de: '# Datenschutz',
      fr: '# Confidentialite',
    });
  });

  it('resolves translations and falls back to English content', () => {
    expect(
      resolvePrivacyPolicyContent('# English', { de: '# Datenschutz' }, 'de'),
    ).to.include({
      content: '# Datenschutz',
      fallbackToDefault: false,
      language: 'de',
    });

    expect(
      resolvePrivacyPolicyContent('# English', { de: '# Datenschutz' }, 'ja'),
    ).to.include({
      content: '# English',
      fallbackToDefault: true,
      language: 'ja',
    });
  });
});
