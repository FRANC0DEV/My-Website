// Import your CSS
import '../../index.css';

import { setupNavbar } from "./navbar";
import { setupHeroSection } from "./hero";
import { setupSkillsAndTechSection } from "./skills-and-technologies";
import { setupContactMeSection } from './contact-me';
// Setup critical features immediately
setupNavbar();
setupHeroSection();
setupSkillsAndTechSection();
setupContactMeSection();
// Lazy load wind animation after page is interactive
// This reduces initial JavaScript execution by ~53%
function loadWindAnimation() {
  // Check if canvas exists
  const canvas = document.getElementById('wind-canvas');
  
  if (!canvas) {
    console.log('Wind animation skipped: canvas not found');
    return;
  }
  
  // Check if canvas is actually visible
  // On mobile/tablet: hidden class → offsetParent = null → skip ✅
  // On desktop: lg:block → offsetParent exists → load ✅
  const isVisible = canvas.offsetParent !== null;
  
  if (!isVisible) {
    console.log('Wind animation skipped: canvas is hidden (mobile/tablet)');
    return;
  }
  
  // Canvas is visible (desktop), load the animation
  console.log('Loading wind animation (desktop)');
  import('./hero/canvas-wind-animation').then(module => {
    module.default(); // Start the animation
  });
}

// Load wind animation when browser is idle (best performance)
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadWindAnimation, { timeout: 2000 });
} else {
  // Fallback: load after a short delay
  setTimeout(loadWindAnimation, 100);
}