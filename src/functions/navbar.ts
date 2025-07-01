import getElement from "../utils/getElement";

export function setupNavbar() {
  const navbarToggle = getElement("navbar-menu-toggle", HTMLButtonElement);
  const themeSwitch = getElement("theme-button", HTMLButtonElement);
  const menu = getElement("navbar-menu", HTMLUListElement);
  navbarToggle.addEventListener("click", () => {
    menu.classList.toggle("open");
    navbarToggle.classList.toggle("open");
    const expanded = navbarToggle.getAttribute("aria-expanded") === "true";
    navbarToggle.setAttribute("aria-expanded", `${!expanded}`);
  });
  themeSwitch.addEventListener("click", () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
  });
}
