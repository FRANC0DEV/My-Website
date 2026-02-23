import { DotLottie } from "@lottiefiles/dotlottie-web";
import getElement from "../../utils/getElement";

export default function startFormAnimation() {
  const formAnimationCanvas = getElement(
    "dotlottie-canvas",
    HTMLCanvasElement,
  );
  new DotLottie({
    autoplay: true,
    loop: true,
    canvas: formAnimationCanvas,
    src: "/src/assets/lottie/Contact.lottie",
    renderConfig: {
      autoResize: false,
    },
  });
}
