import contentData from "@/data/content.json";

export const locales = ["en", "tr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// The English block is the canonical shape; the Turkish block mirrors it exactly.
export type Content = (typeof contentData)["en"];

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "tr";
}

export function getContent(locale: Locale): Content {
  return contentData[locale] as Content;
}
