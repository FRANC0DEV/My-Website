import getElement from "../../utils/getElement";
import { getLanguage, setLanguage } from "../i18n/i18n";

/**
 * Accessible language menu (WAI-ARIA menu button pattern).
 *
 * - The trigger exposes aria-haspopup="menu" and aria-expanded.
 * - Options are role="menuitemradio" with aria-checked marking the active
 *   language, so assistive tech announces the current selection.
 * - Keyboard: ↑/↓ cycle options, Home/End jump to the ends, Esc closes and
 *   restores focus to the trigger, Tab closes the menu naturally.
 * - Switching happens in place (no page reload) via the i18n module, which
 *   also keeps the URL (?lang=es) and localStorage in sync.
 */
export function initLanguageSwitcher() {
  const dropdown = getElement("languageDropdown");
  const button = getElement("languageButton", HTMLButtonElement);
  const status = getElement("languageStatus");
  let isOpen = false;

  const getItems = (): HTMLButtonElement[] =>
    Array.from(
      dropdown.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
    );

  /** Keep aria-checked in sync with the active language. */
  function syncCheckedState() {
    const activeId = `lang-${getLanguage()}`;
    getItems().forEach((item) => {
      item.setAttribute("aria-checked", String(item.id === activeId));
    });
  }

  function openMenu(focus: "first" | "last" | "none" = "first") {
    if (isOpen) return;
    isOpen = true;
    dropdown.classList.add("active"); // shows the popover (CSS)
    button.setAttribute("aria-expanded", "true");

    if (focus === "none") return;
    const items = getItems();
    const target =
      focus === "last"
        ? items[items.length - 1]
        : (items.find((item) => item.getAttribute("aria-checked") === "true") ??
          items[0]);
    target?.focus();
  }

  function closeMenu(restoreFocus = false) {
    if (!isOpen) return;
    isOpen = false;
    dropdown.classList.remove("active");
    button.setAttribute("aria-expanded", "false");
    if (restoreFocus) button.focus();
  }

  // Toggle: opening focuses the active option (menu button pattern)
  button.addEventListener("click", () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  button.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu("first");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu("last");
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu(true);
    }
  });

  // Keyboard navigation inside the menu
  dropdown.addEventListener("keydown", (event) => {
    const items = getItems();
    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        items[(currentIndex + 1) % items.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        items[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case "Escape":
        event.preventDefault();
        closeMenu(true);
        break;
      case "Tab":
        closeMenu(); // let the browser move focus naturally
        break;
      default:
        break;
    }
  });

  // Option selection: switch in place, update UI, restore focus
  getItems().forEach((item) => {
    item.addEventListener("click", () => {
      const language = item.id === "lang-es" ? "es" : "en";
      setLanguage(language);
      syncCheckedState();
      status.textContent =
        language === "es" ? "Idioma: español" : "Language: English";
      closeMenu(true);
    });
  });

  // Click outside closes the menu (focus stays where the user clicked)
  document.addEventListener("click", (event) => {
    const target = event.target as Node | null;
    if (!target || !isOpen) return;
    if (!dropdown.contains(target) && !button.contains(target)) closeMenu();
  });

  syncCheckedState();
}
