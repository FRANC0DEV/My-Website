import getElement from "../../utils/getElement";

type Language = "en" | "es";
export function initLanguageSwitcher() {
  let currentLang: Language = "en"; // Track current language
  let isOpen = false; // Track if dropdown is open

  const dropdown = getElement("languageDropdown");
  const button = getElement("languageButton", HTMLButtonElement);

  // 1️⃣ CHECK URL ON PAGE LOAD
  // If URL is ?lang=es, set Spanish. If ?lang=en, set English
  const params = new URLSearchParams(window.location.search);
  if (params.get("lang") === "es") {
    currentLang = "es";
  } else if (params.get("lang") === "en") {
    currentLang = "en";
  }

  // 2️⃣ TOGGLE DROPDOWN (open/close)
  function toggleDropdown() {
    if (isOpen) {
      dropdown.classList.remove("active"); // Remove 'active' = triggers hide animation
      isOpen = false;
    } else {
      dropdown.classList.add("active"); // Add 'active' = triggers show animation
      isOpen = true;
    }
    button.setAttribute("aria-expanded", `${isOpen}`);
  }

  // Close dropdown
  function closeDropdown() {
    dropdown.classList.remove("active");
    button.setAttribute("aria-expanded", "false");
    isOpen = false;
  }

  // 4️⃣ CHANGE LANGUAGE AND UPDATE URL
  function setLanguage(lang: Language) {
    closeDropdown();
    const newSearchParams = new URLSearchParams(params);
    const url = new URL(window.location.href);
    newSearchParams.set("lang", lang);
    const newURL = `${url.origin}${url.pathname}?${newSearchParams.toString()}`;
    setTimeout(() => {
      window.location.href = newURL;
    }, 200);
  }

  // 5️⃣ EVENT LISTENERS

  // Click language button to toggle dropdown
  button.addEventListener("click", (e) => {
    e.stopPropagation(); // Don't trigger "click outside" listener
    toggleDropdown();
  });

  // Click Spanish option
  getElement("lang-es").addEventListener("click", () => {
    setLanguage("es");
  });

  // Click English option
  getElement("lang-en").addEventListener("click", () => {
    setLanguage("en");
  });

  // Click anywhere outside = close dropdown
  document.addEventListener("click", (e) => {
    if (
      e.target! ||
      (!dropdown.contains(e.target) && !button.contains(e.target))
    ) {
      closeDropdown();
    }
  });

  // Press ESC key = close dropdown
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeDropdown();
    }
  });

  // Apply language on page load
  translateTagsText(currentLang);
  translateAttributes("placeholder", currentLang);
  document.documentElement.lang = currentLang;
}

/**AUX FUNCTIONS */
function translateAttributes(attr: string, currentLang: Language) {
  const elements = document.querySelectorAll(`[data-lang-es-${attr}]`);
  elements.forEach((element) => {
    const esValue = element.getAttribute(`data-lang-es-${attr}`) as string;
    const originalAttr = `data-lang-original-${attr}`;

    if (currentLang === "es") {
      const original = element.getAttribute(attr);

      if (!element.hasAttribute(originalAttr)) {
        element.setAttribute(originalAttr, original ?? "");
      }

      element.setAttribute(attr, esValue);
    } else {
      const original = element.getAttribute(originalAttr);
      if (original !== null) {
        element.setAttribute(attr, original);
      }
    }
  });
}

function translateTagsText(currentLang: Language) {
  const elementsToTranslate = document.querySelectorAll("[data-lang-es]");
  elementsToTranslate.forEach((element) => {
    if (currentLang === "es") {
      // SPANISH: Get Spanish text from data-lang-es
      const spanishText = element.getAttribute("data-lang-es") as string;
      const englishText = (element.textContent ?? "").trim();
      // Save original English text (first time only)
      if (!element.hasAttribute("data-lang-original")) {
        element.setAttribute("data-lang-original", englishText);
      }

      element.textContent = spanishText; // Show Spanish
    } else {
      // ENGLISH: Get back the original English text
      const originalText = element.getAttribute("data-lang-original");
      if (originalText) {
        element.textContent = originalText; // Show English
      }
    }
  });
}
