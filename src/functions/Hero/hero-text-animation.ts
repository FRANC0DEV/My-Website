import getElement from "../../utils/getElement";

function StartHeroMessageAnimation() {
  const keyTexts = [
    {
      value: "Attractive",
      color: "#f6339a",
    },
    {
      value: "Secure",
      color: "#05df72",
    },
    {
      value: "Effective",
      color: "oklch(62.3% 0.214 259.815)",
    },
  ] as const;

  const dynamicText = getElement("hero-text-animation-target");

  let wordIndex = 0;
  let charIndex = 1;
  let isDeleting = false;
  const typeEffect = () => {
    const currentWord = keyTexts[wordIndex].value;
    const currentChar = currentWord.substring(0, charIndex);
    dynamicText.textContent = currentChar;
    if (!isDeleting && charIndex < currentWord.length) {
      // If condition is true, type the next character
      charIndex++;
      setTimeout(typeEffect, 100);
    } else if (isDeleting && charIndex > 0) {
      // If condition is true, remove the previous character
      charIndex--;
      setTimeout(typeEffect, 100);
    } else {
      //either we reach the end of the word or we got no characters left to erase
      isDeleting = !isDeleting;

      //If the word is deleted then switch to the next word
      wordIndex = !isDeleting ? (wordIndex + 1) % keyTexts.length : wordIndex;

      if (!isDeleting) {
        //we change the font color
        dynamicText.style.color = keyTexts[wordIndex].color;
      }
      setTimeout(typeEffect, 600);
    }
  };
}

export default StartHeroMessageAnimation;
