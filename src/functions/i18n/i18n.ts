/**
 * Tiny in-house i18n for this static, attribute-driven site.
 *
 * How it works: English is the base language and ships inline in the HTML
 * (the site stays readable without JavaScript); Spanish lives in
 * `data-lang-es` attributes, and `data-lang-es-{attribute}` covers element
 * attributes such as `data-lang-es-aria-label`. Switching happens *in place*
 * (no reload, no scroll jump) and is synced to the URL (`?lang=es`) via
 * history.replaceState plus localStorage for persistence. The initial
 * language resolves as: URL > localStorage > browser language > English.
 *
 * Why not an i18n library (i18next, @formatjs/intl, lit-localize...)?
 * Those are key/JSON-based: adopting one means re-keying every string in
 * every partial, loading translations after JS boots (text flash unless
 * pre-rendered), and shipping features this site does not use. Migrate when
 * one of these becomes true:
 *  - a third locale joins, or translations no longer fit in the DOM;
 *  - we need plurals, interpolation, or locale-formatted dates/numbers;
 *  - the site moves to a framework with first-class i18n support.
 */

export type Language = "en" | "es";

export const DEFAULT_LANGUAGE: Language = "en";
export const SUPPORTED_LANGUAGES: readonly Language[] = ["en", "es"];

/**
 * Element attributes that also carry a Spanish variant in the markup, e.g.
 * `data-lang-es-aria-label`, `data-lang-es-placeholder`, or `data-lang-es-href`
 * (the Download CV button points at a different PDF per language).
 */
const TRANSLATED_ATTRIBUTES = ["aria-label", "placeholder", "href"] as const;

const STORAGE_KEY = "portfolio:lang";

let currentLanguage: Language = DEFAULT_LANGUAGE;
let initialized = false;

function isSupported(value: string | null): value is Language {
  return value === "en" || value === "es";
}

/** Initial language: URL ?lang > localStorage > browser language > English. */
function detectLanguage(): Language {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (isSupported(fromUrl)) return fromUrl;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) return stored;
  } catch {
    // localStorage can throw in private mode: ignore and fall through
  }

  const candidates =
    navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    if (candidate.toLowerCase().startsWith("es")) return "es";
  }

  return DEFAULT_LANGUAGE;
}

/** Keep the URL in sync (?lang=es); the default language keeps a clean URL. */
function syncUrl(language: Language): void {
  const url = new URL(window.location.href);
  if (language === DEFAULT_LANGUAGE) {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", language);
  }
  window.history.replaceState(null, "", url);
}

function persist(language: Language): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Private mode: persistence is best-effort
  }
}

function translateTexts(language: Language): void {
  const elements = document.querySelectorAll("[data-lang-es]");
  elements.forEach((element) => {
    const spanishText = element.getAttribute("data-lang-es");
    if (spanishText === null) return;

    if (import.meta.env.DEV) {
      if (!spanishText.trim()) {
        console.warn("[i18n] empty data-lang-es on", element);
      }
      if (element.children.length > 0) {
        console.warn(
          "[i18n] data-lang-es must be a text-only leaf, but it has children:",
          element,
        );
      }
    }

    // Remember the original English text the first time we touch the node
    if (!element.hasAttribute("data-lang-original")) {
      element.setAttribute(
        "data-lang-original",
        (element.textContent ?? "").trim(),
      );
    }

    if (language === "es") {
      element.textContent = spanishText;
    } else {
      const original = element.getAttribute("data-lang-original");
      if (original !== null) element.textContent = original;
    }
  });
}

function translateAttributes(language: Language): void {
  for (const attribute of TRANSLATED_ATTRIBUTES) {
    const source = `data-lang-es-${attribute}`;
    const backup = `data-lang-original-${attribute}`;

    document.querySelectorAll(`[${source}]`).forEach((element) => {
      const spanishValue = element.getAttribute(source);
      if (spanishValue === null) return;

      // Remember the original attribute value the first time
      if (!element.hasAttribute(backup)) {
        element.setAttribute(backup, element.getAttribute(attribute) ?? "");
      }

      if (language === "es") {
        element.setAttribute(attribute, spanishValue);
      } else {
        const original = element.getAttribute(backup);
        if (original !== null) element.setAttribute(attribute, original);
      }
    });
  }
}

function applyLanguage(language: Language): void {
  translateTexts(language);
  translateAttributes(language);
  document.documentElement.lang = language;
}

/** Resolve and apply the initial language. Call once, before any UI setup. */
export function initI18n(): Language {
  if (initialized) return currentLanguage;
  initialized = true;

  currentLanguage = detectLanguage();
  applyLanguage(currentLanguage);
  syncUrl(currentLanguage);
  persist(currentLanguage);

  return currentLanguage;
}

export function getLanguage(): Language {
  return currentLanguage;
}

/** Switch language in place: translate, update <html lang>, URL and storage. */
export function setLanguage(language: Language): void {
  if (language === currentLanguage) return;

  currentLanguage = language;
  applyLanguage(language);
  syncUrl(language);
  persist(language);
}
