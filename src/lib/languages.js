// Supported translation languages — all supported by DeepL's API.
// `code` is the DeepL-compatible language code (en → EN-US, pt → PT-BR variant).
// Add a language here → it shows up everywhere automatically.
export const LANGUAGES = [
  { code: "bg", en: "Bulgarian", fr: "Bulgare" },
  { code: "cs", en: "Czech", fr: "Tchèque" },
  { code: "da", en: "Danish", fr: "Danois" },
  { code: "de", en: "German", fr: "Allemand" },
  { code: "el", en: "Greek", fr: "Grec" },
  { code: "en", en: "English", fr: "Anglais" },
  { code: "es", en: "Spanish", fr: "Espagnol" },
  { code: "et", en: "Estonian", fr: "Estonien" },
  { code: "fi", en: "Finnish", fr: "Finnois" },
  { code: "fr", en: "French", fr: "Français" },
  { code: "hu", en: "Hungarian", fr: "Hongrois" },
  { code: "it", en: "Italian", fr: "Italien" },
  { code: "ja", en: "Japanese", fr: "Japonais" },
  { code: "ko", en: "Korean", fr: "Coréen" },
  { code: "lt", en: "Lithuanian", fr: "Lituanien" },
  { code: "lv", en: "Latvian", fr: "Letton" },
  { code: "nb", en: "Norwegian", fr: "Norvégien" },
  { code: "nl", en: "Dutch", fr: "Néerlandais" },
  { code: "pl", en: "Polish", fr: "Polonais" },
  { code: "pt", en: "Portuguese", fr: "Portugais" },
  { code: "ro", en: "Romanian", fr: "Roumain" },
  { code: "ru", en: "Russian", fr: "Russe" },
  { code: "sk", en: "Slovak", fr: "Slovaque" },
  { code: "sl", en: "Slovenian", fr: "Slovène" },
  { code: "sv", en: "Swedish", fr: "Suédois" },
  { code: "tr", en: "Turkish", fr: "Turc" },
  { code: "uk", en: "Ukrainian", fr: "Ukrainien" },
  { code: "zh", en: "Chinese", fr: "Chinois" },
];

export const LANGUAGE_COUNT = LANGUAGES.length;

/** Bilingual label lookup — tolerant of codes and legacy values ("French (FR)"). */
export function langName(value, locale = "en") {
  if (!value) return "—";
  const v = String(value).trim().toLowerCase();
  const direct = LANGUAGES.find((l) => l.code === v);
  if (direct) return locale === "fr" ? direct.fr : direct.en;
  const legacy = LANGUAGES.find((l) => v.includes(l.code) || v.includes(l.en.toLowerCase()) || v.includes(l.fr.toLowerCase()));
  if (legacy) return locale === "fr" ? legacy.fr : legacy.en;
  return String(value); // leave unknown values as-is
}

/** Code → DeepL target code (DeepL requires the EN-US / PT-BR variant). */
export function deeplCode(value) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  if (v === "auto" || v === "auto-detect" || v === "détection auto" || v === "") return null;
  if (v === "en") return "EN-US";
  if (v === "pt") return "PT-BR";
  return v.toUpperCase();
}
