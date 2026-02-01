import getElement from "../../utils/getElement";
import InitializeThemeToggle from "./theme-toggle";
import InitializeHeroTextAnimation from "./hero-text-animation";
export function setupNavbar() {
  const navbarToggle = getElement("navbar-menu-toggle", HTMLButtonElement);
  const menu = getElement("navbar-menu", HTMLUListElement);
  navbarToggle.addEventListener("click", () => {
    menu.classList.toggle("translate-y-full");
  });
  InitializeThemeToggle();
  InitializeHeroTextAnimation();
}
