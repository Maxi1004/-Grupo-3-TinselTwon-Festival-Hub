import { useMemo } from "react";
import { useAutoTranslate } from "./useAutoTranslate";

const SCRAPED_FORM_SOURCE_LANGUAGE = "en";

type TranslatableSection = {
  title: string;
  fields: Array<{ label: string }>;
};

export function useScrapedFormTranslation(
  sections: TranslatableSection[],
  language: string,
  token?: string | null
): {
  getTranslatedSectionTitle: (title: string) => string;
  getTranslatedFieldLabel: (label: string) => string;
} {
  const labelTexts = useMemo(() => {
    const texts = new Set<string>();
    sections.forEach((section) => {
      if (section.title) texts.add(section.title);
      section.fields.forEach((field) => {
        if (field.label) texts.add(field.label);
      });
    });
    return Array.from(texts);
  }, [sections]);

  const { tAuto } = useAutoTranslate(labelTexts, language, token, SCRAPED_FORM_SOURCE_LANGUAGE);

  return {
    getTranslatedSectionTitle: (title: string) => tAuto(title),
    getTranslatedFieldLabel: (label: string) => tAuto(label),
  };
}
