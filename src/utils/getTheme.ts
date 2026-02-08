import type { BrowserTheme } from "../types/theme";
function getTheme(): BrowserTheme {
  /**Knowing preference from browser configuration or last saved preference*/
  const themePreference = localStorage.getItem("data-theme");
  const prefersDarkByDefault = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  if (themePreference && ["light", "dark"].includes(themePreference)) {
    return themePreference as BrowserTheme;
  }
  if (prefersDarkByDefault) {
    return "dark";
  } else {
    return "light";
  }
}

export default getTheme;
