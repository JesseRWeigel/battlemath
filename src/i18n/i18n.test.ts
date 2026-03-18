import { getTranslations, Locale, Translations } from './index';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';

const LOCALES: Locale[] = ['en', 'es', 'fr'];
const translationMaps: Record<Locale, Translations> = { en, es, fr };

describe('i18n', () => {
  it('getTranslations returns correct locale', () => {
    expect(getTranslations('en')).toBe(en);
    expect(getTranslations('es')).toBe(es);
    expect(getTranslations('fr')).toBe(fr);
  });

  it('all locales have the same keys', () => {
    const enKeys = Object.keys(en).sort();
    for (const locale of LOCALES) {
      const keys = Object.keys(translationMaps[locale]).sort();
      expect(keys).toEqual(enKeys);
    }
  });

  it('all hint arrays have at least 3 entries', () => {
    for (const locale of LOCALES) {
      const t = getTranslations(locale);
      expect(t.hintEncourage.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('all success message arrays have at least 3 entries', () => {
    for (const locale of LOCALES) {
      const t = getTranslations(locale);
      expect(t.successMessages.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('no translation values are empty strings', () => {
    for (const locale of LOCALES) {
      const t = getTranslations(locale);
      for (const [key, value] of Object.entries(t)) {
        if (typeof value === 'string') {
          expect(value.length).toBeGreaterThan(0);
        } else if (Array.isArray(value)) {
          for (const item of value) {
            expect(item.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('howToPlayText arrays have same length across locales', () => {
    const enLen = en.howToPlayText.length;
    for (const locale of LOCALES) {
      expect(translationMaps[locale].howToPlayText.length).toBe(enLen);
    }
  });

  it('readyText arrays have same length across locales', () => {
    const enLen = en.readyText.length;
    for (const locale of LOCALES) {
      expect(translationMaps[locale].readyText.length).toBe(enLen);
    }
  });
});
