import getElement from "../../utils/getElement";

/**Data type for value in the local storage */
type BrowserTheme = "dark" | "light" | null;

/**Theme-toggle initializer */
export default function Initialize() {
  /**Reference to the <HTML> tag */
  const html = document.documentElement;

  /**Knowing preference from browser configuration or last saved preference*/
  const themePreference: BrowserTheme = localStorage.getItem(
    "data-theme",
  ) as BrowserTheme;
  const prefersDarkByDefault =
    window.matchMedia("(prefers-color-scheme: dark)").matches ||
    themePreference === "dark";

  /**Establishing initial theme parameters*/
  if (prefersDarkByDefault) {
    html.setAttribute("data-theme", "dark");
    localStorage.setItem("data-theme", "dark");
  } else {
    html.setAttribute("data-theme", "light");
    localStorage.setItem("data-theme", "light");
  }

  /**Pointing to theme toggle*/
  const themeSwitch = getElement("light-theme-button", HTMLButtonElement);

  /**Adding handler to toogle theme*/
  themeSwitch.addEventListener("click", () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("data-theme", newTheme);
  });
}
