import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { Locale, Translations } from './types';

export type { Locale, Translations };

const translations: Record<Locale, Translations> = { en, es, fr };

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? translations.en;
}
