import getElement from "../../utils/getElement";

type Language = "en" | "es";
export function initLanguageSwitcher() {
  let currentLang: Language = "en"; // Track current language
  let isOpen = false; // Track if dropdown is open

  const dropdown = getElement("languageDropdown");
  const button = getElement("languageButton", HTMLButtonElement);

  // 1️⃣ CHECK URL ON PAGE LOAD
  // If URL is /es/something, set Spanish. If /en/something, set English
  const path = window.location.pathname;
  if (path.includes("/es")) {
    currentLang = "es";
  } else if (path.includes("/en")) {
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
  }

  // Close dropdown
  function closeDropdown() {
    dropdown.classList.remove("active");
    isOpen = false;
  }

  // 3️⃣ APPLY LANGUAGE TO ALL ELEMENTS
  // Find every element with data-lang-es and swap its text
  function applyLanguage() {
    const elementsToTranslate = document.querySelectorAll("[data-lang-es]");

    elementsToTranslate.forEach((element) => {
      if (currentLang === "es") {
        // SPANISH: Get Spanish text from data-lang-es
        const spanishText = element.getAttribute("data-lang-es") as string;

        // Save original English text (first time only)
        if (!element.hasAttribute("data-lang-original")) {
          element.setAttribute(
            "data-lang-original",
            element.textContent.trim(),
          );
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

    document.documentElement.lang = currentLang; // Update <html lang="en/es">
  }

  // 4️⃣ CHANGE LANGUAGE AND UPDATE URL
  function setLanguage(lang: Language) {
    currentLang = lang;

    // Update URL: /about → /es/about or /en/about
    const currentPath = window.location.pathname;
    let newPath;

    if (currentPath.includes("/es") || currentPath.includes("/en")) {
      // Already has language: /es/about → /en/about
      newPath = currentPath.replace(/\/(es|en)/, `/${lang}`);
    } else {
      // No language yet: /about → /es/about
      newPath = `/${lang}${currentPath}`;
    }

    window.history.pushState({}, "", newPath); // Change URL without reload
    applyLanguage(); // Update all text
    closeDropdown(); // Close the menu
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
  applyLanguage();
}
