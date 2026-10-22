import getElement from "../../utils/getElement";

/**
 * Register every certificate image so Vite resolves its final URL at build
 * time (hashed filename in production, /src path in dev). This lets the
 * modal load images referenced only by filename in data-images attributes.
 */
const certificateAssets = import.meta.glob("../../assets/certificates/*", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** Resolve a plain filename (e.g. "docker-uni.jpeg") to its final asset URL */
function resolveCertificateAsset(fileName: string): string | undefined {
  const match = Object.entries(certificateAssets).find(([key]) =>
    key.endsWith(`/${fileName}`),
  );
  return match?.[1];
}

type CertificateCardData = {
  images: string[];
  title: string;
  issuer: string;
};

export function setupCertificatesSection() {
  const grid = getElement("certificates-grid");
  const modal = getElement("certificate-modal", HTMLDivElement);
  const modalImage = getElement("certificate-modal-image", HTMLImageElement);
  const modalTitle = getElement("certificate-modal-title");
  const modalIssuer = getElement("certificate-modal-issuer");
  const modalTabs = getElement("certificate-modal-tabs", HTMLDivElement);
  const closeButton = getElement(
    "certificate-modal-close",
    HTMLButtonElement,
  );

  const cards = Array.from(
    document.querySelectorAll<HTMLElement>(".certificate-card"),
  );

  let activeImages: string[] = [];
  let activeTab = 0;
  let lastFocusedElement: HTMLElement | null = null;

  /** Current UI language, taken from <html lang> (set by the language switcher) */
  function currentLang(): "en" | "es" {
    return document.documentElement.lang === "es" ? "es" : "en";
  }

  /** Labels for the page tabs: 0 = certificate, 1+ = syllabus/temario */
  function tabLabel(index: number): string {
    const spanish = currentLang() === "es";
    if (index === 0) return spanish ? "Certificado" : "Certificate";
    return spanish ? "Temario" : "Syllabus";
  }

  function tabClassNames(isActive: boolean): string {
    return isActive
      ? "cursor-pointer rounded-md px-2 py-1 text-xs font-mono font-medium bg-principal-800 text-principal-50 transition-colors"
      : "cursor-pointer rounded-md px-2 py-1 text-xs font-mono font-medium text-principal-500 hover:bg-principal-200/60 transition-colors";
  }

  function getCardData(card: HTMLElement): CertificateCardData {
    const images = (card.dataset.images ?? "")
      .split(",")
      .map((fileName) => resolveCertificateAsset(fileName.trim()))
      .filter((url): url is string => Boolean(url));
    const title =
      card.querySelector("h3")?.textContent?.trim() ?? "Certificate";
    const issuer =
      card
        .querySelector("[data-certificate-issuer]")
        ?.textContent?.trim() ?? "";
    return { images, title, issuer };
  }

  function renderTabs(imageCount: number) {
    modalTabs.innerHTML = "";
    if (imageCount <= 1) {
      modalTabs.classList.add("hidden");
      modalTabs.classList.remove("flex");
      return;
    }
    modalTabs.classList.remove("hidden");
    modalTabs.classList.add("flex");

    for (let i = 0; i < imageCount; i++) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = tabLabel(i);
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", `${i === activeTab}`);
      button.className = tabClassNames(i === activeTab);
      button.addEventListener("click", () => selectTab(i));
      modalTabs.appendChild(button);
    }
  }

  function selectTab(index: number) {
    activeTab = index;
    const src = activeImages[activeTab];
    if (src) modalImage.src = src;

    const tabs = Array.from(modalTabs.querySelectorAll("button"));
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", `${i === activeTab}`);
      tab.className = tabClassNames(i === activeTab);
    });
  }

  function openModal(card: HTMLElement) {
    const data = getCardData(card);
    if (data.images.length === 0) return;

    activeImages = data.images;
    activeTab = 0;
    lastFocusedElement = document.activeElement as HTMLElement | null;

    modalTitle.textContent = data.title;
    modalIssuer.textContent = data.issuer;
    modalImage.src = activeImages[0];
    modalImage.alt = `${data.title} - ${data.issuer}`;
    renderTabs(activeImages.length);

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
    modalImage.removeAttribute("src");
    lastFocusedElement?.focus();
    lastFocusedElement = null;
  }

  /** Card click (stretched button) opens the lightbox */
  cards.forEach((card) => {
    const trigger = card.querySelector<HTMLButtonElement>(
      ".certificate-card-button",
    );
    trigger?.addEventListener("click", () => openModal(card));
  });

  /** External triggers (e.g. the Infofest honors badge) open a card's modal */
  document
    .querySelectorAll<HTMLElement>("[data-certificate-open]")
    .forEach((trigger) => {
      const key = trigger.getAttribute("data-certificate-open") ?? "";
      const card = cards.find((candidate) =>
        (candidate.dataset.images ?? "").includes(key),
      );
      if (!card) return;
      trigger.addEventListener("click", () => openModal(card));
    });

  closeButton.addEventListener("click", closeModal);

  /** Click on the backdrop (outside the dialog box) closes the modal */
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  /** ESC key closes the modal */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  /** Fade-in the grid when it scrolls into view (same pattern as tech cards) */
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-[fadeIn_0.5s_linear_forwards]");
        fadeInObserver.unobserve(entry.target);
      }
    });
  });
  fadeInObserver.observe(grid);
}
