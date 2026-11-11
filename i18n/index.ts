import type { PropertyCategory } from "@/data/properties";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "./config";
import enDictionary from "./dictionaries/en.json";
import esDictionary from "./dictionaries/es.json";
import deDictionary from "./dictionaries/de.json";

export type Dictionary = typeof enDictionary;

/**
 * Registry of all supported dictionaries.
 * TypeScript enforces that every locale dictionary matches `en.json` keys.
 * To add a new language, import its JSON file above and add an entry here.
 */
export const DICTIONARIES: Record<Locale, Dictionary> = {
  es: esDictionary,
  en: enDictionary,
  de: deDictionary,
};

export function getDictionarySync(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return DICTIONARIES[isValidLocale(locale) ? locale : DEFAULT_LOCALE];
}

export async function getDictionary(
  locale: Locale = DEFAULT_LOCALE
): Promise<Dictionary> {
  return getDictionarySync(locale);
}

/**
 * Replaces `{key}` placeholders in a translation string with values.
 */
export function formatMessage(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key)
      ? String(values[key])
      : `{${key}}`
  );
}

export function translateCategory(
  dict: Dictionary,
  category: PropertyCategory
): string {
  return dict.categories[category] ?? category;
}

export function translateAmenity(dict: Dictionary, amenity: string): string {
  const amenitiesMap = dict.amenities as Record<string, string>;
  return amenitiesMap[amenity] ?? amenity;
}

export function translateBadge(
  dict: Dictionary,
  badge: string | undefined
): string | undefined {
  if (!badge) return undefined;
  const badgesMap = dict.badges as Record<string, string>;
  return badgesMap[badge] ?? badge;
}

export function translateAgentRole(dict: Dictionary, role: string): string {
  const rolesMap = dict.property.agent.roles as Record<string, string>;
  return rolesMap[role] ?? role;
}

export function translateDescriptionParagraph(
  dict: Dictionary,
  paragraph: string
): string {
  const paragraphsMap = dict.property.about.paragraphs as Record<
    string,
    string
  >;
  return paragraphsMap[paragraph] ?? paragraph;
}
