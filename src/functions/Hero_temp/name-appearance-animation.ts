import getElement from "../../utils/getElement";

function AnimateNameAppearance() {
  const nameContainer = getElement("my-name", HTMLDivElement);
  const letters = Array.from(nameContainer.querySelectorAll("span"));

  // Create indexes array and sort it randomly
  let indexes = letters.map((_, i) => i);
  indexes = indexes.sort(() => Math.random() - 0.5);

  // Animate each letter with an interval of 1s
  indexes.forEach((index, position) => {
    setTimeout(() => {
      letters[index].classList.add(
        "animate-[fadeIn_1.15s_cubic-bezier(.47,.1,0,1.01)_forwards]",
      );
    }, position * 140); // 1000ms = 1 segundo
  });
}

export default AnimateNameAppearance;
