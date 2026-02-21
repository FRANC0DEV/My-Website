// Import fonts FIRST
import '@fontsource/quicksand/300.css';
import '@fontsource/quicksand/400.css';
import '@fontsource/quicksand/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/julius-sans-one/400.css';
// Then your CSS
import '../../index.css';

import { setupNavbar } from "./navbar";
import { setupHeroSection } from "./hero";
import { setupSkillsAndTechSection } from "./skills-and-technologies";
setupNavbar();
setupHeroSection();
setupSkillsAndTechSection();
