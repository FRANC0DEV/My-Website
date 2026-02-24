import getElement from "../../utils/getElement";
/**Data type for value in the local storage */
import getTheme from "../../utils/getTheme";

/**Theme-toggle initializer */
export default function Initialize() {
  /**Reference to the <HTML> tag */
  const html = document.documentElement;

  /**Knowing preference from browser configuration or last saved preference*/
  const themePreference = getTheme();
  /**Establishing initial theme parameters*/
  html.setAttribute("data-theme", themePreference);
  localStorage.setItem("data-theme", themePreference);

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
