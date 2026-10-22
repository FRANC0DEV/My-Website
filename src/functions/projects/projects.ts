import getElement from "../../utils/getElement";

/**
 * Reveal the project cards when the grid scrolls into view.
 *
 * Same pattern used by the skills section: the grid ships with `opacity-0`
 * in the markup (no JS = no flash of content that then re-animates) and the
 * IntersectionObserver adds the fade-in utility class once, then stops
 * observing so the animation never replays.
 */
export function setupProjectsSection() {
  const projectsGrid = getElement("projects-grid");

  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-[fadeIn_0.5s_linear_forwards]");
        fadeInObserver.unobserve(entry.target); // Stop observing after animation starts
      }
    });
  });

  fadeInObserver.observe(projectsGrid);
}
