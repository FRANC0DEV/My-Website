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
    src: "https://lottie.host/d16af884-1198-479c-9018-08b1d6661f15/SsDAj33ssj.lottie",
    renderConfig: {
      autoResize: true,
    },
  });
}
