import getElement from "../../utils/getElement";

export default function startFadeInAnimation() {
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fade-in");
        fadeInObserver.unobserve(entry.target); // Stop observing after animation starts
      }
    });
  });

  const staticCardsContainer = getElement(
    "static-tech-cards-container",
    HTMLDivElement,
  );

  const observedElements = [staticCardsContainer];
  observedElements.forEach((el) => {
    fadeInObserver.observe(el);
  });
}
