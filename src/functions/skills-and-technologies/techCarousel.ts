// src/components/techCarousel.ts
export function initTechCarousel(): void {
  const carousel = document.getElementById('techcarousel');
  if (!carousel) return;

  let isCloned = false;

  function handleResize(): void {
    if (!carousel) return;
    const isVisible = window.getComputedStyle(carousel).display !== 'none';

    if (isVisible && !isCloned) {
      // Clone the group and append it to the track (not the viewport container)
      const track = carousel.querySelector('.carouseltrack');
      const originalGroup = carousel.querySelector('.carouselgroup');
      if (track && originalGroup) {
        const clone = originalGroup.cloneNode(true) as HTMLElement;
        clone.setAttribute('aria-hidden', 'true');

        // Make links non-focusable
        clone.querySelectorAll('a').forEach(link => {
          link.setAttribute('tabindex', '-1');
        });

        track.appendChild(clone);
        isCloned = true;
      }
    }
  }

  // Check on load
  handleResize();

  // Check on resize
  window.addEventListener('resize', handleResize);
}