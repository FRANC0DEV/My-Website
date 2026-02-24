import getElement from "../../utils/getElement";
import emailjs from '@emailjs/browser'
interface ContactFormStatus {
  nameValid: boolean;
  emailValid: boolean;
  messageValid: boolean;
}

export default function setupContactForm() {
  const form = getElement("contact-form", HTMLFormElement);
  const nameInput = getElement("form-contact-name", HTMLInputElement);
  const nameInputLabel = getElement(
    "form-contact-name-label",
    HTMLLabelElement,
  );
  const emailInput = getElement("form-contact-email", HTMLInputElement);
  const emailInputLabel = getElement(
    "form-contact-email-label",
    HTMLLabelElement,
  );
  const messageInput = getElement("form-contact-message", HTMLTextAreaElement);
  const messageInputLabel = getElement(
    "form-contact-message-label",
    HTMLLabelElement,
  );
  const sendEmailButton = getElement("contact-form-submit-button", HTMLButtonElement);
  // Create toast container if it doesn't exist - TOP CENTER
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className =
      "fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 max-w-md w-full px-4";
    toastContainer.setAttribute("aria-live", "assertive");
    toastContainer.setAttribute("aria-atomic", "true");
    toastContainer.setAttribute("role", "alert");
    document.body.appendChild(toastContainer);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset error states
    nameInputLabel.classList.remove("error");
    emailInputLabel.classList.remove("error");
    messageInputLabel.classList.remove("error");
    nameInput.setAttribute("aria-invalid", "false");
    emailInput.setAttribute("aria-invalid", "false");
    messageInput.setAttribute("aria-invalid", "false");
    // Disable submit button to avoid multiple clicks
    sendEmailButton.disabled = true;
    const formStatus: ContactFormStatus = {
      nameValid: true,
      emailValid: true,
      messageValid: true,
    };

    const errorsList: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const formData = new FormData(form);
    const name = (formData.get("form-contact-name") as string).trim();
    const email = (formData.get("form-contact-email") as string).trim();
    const message = (formData.get("form-contact-message") as string).trim();

    // Validation
    if (name.length < 2) {
      errorsList.push("Please enter a valid name (at least 2 characters)");
      formStatus.nameValid = false;
    }

    if (!emailRegex.test(email)) {
      errorsList.push("Please enter a valid email address");
      formStatus.emailValid = false;
    }

    if (message.length < 10) {
      errorsList.push("Enter a valid message (at least 10 characters).");
      formStatus.messageValid = false;
    }

    if (
      formStatus.emailValid &&
      formStatus.messageValid &&
      formStatus.nameValid
    ) {
      await sendEmail(name, email,message,form);
    } else {
      // Set error states and focus first invalid field
      if (!formStatus.nameValid) {
        nameInputLabel.classList.add("error");
        nameInput.setAttribute("aria-invalid", "true");
        nameInput.focus();
      }

      if (!formStatus.emailValid) {
        emailInputLabel.classList.add("error");
        emailInput.setAttribute("aria-invalid", "true");
        if (formStatus.nameValid) emailInput.focus();
      }

      if (!formStatus.messageValid) {
        messageInputLabel.classList.add("error");
        messageInput.setAttribute("aria-invalid", "true");
        if (formStatus.nameValid && formStatus.emailValid) messageInput.focus();
      }

      toastError(errorsList);
    }
    //we re-activate the send button
    sendEmailButton.disabled=false;
  });
}


async function sendEmail(name: string, email: string, message: string, form: HTMLFormElement) {
    try {
        await emailjs.send(
            'service_hgryf1f',
            'template_1vgarb5',
            {
                name,
                email,
                message,
            },
            {
                publicKey: 'HtGhDLoY4ucfSkQvL',
            }    
        );
        showToast("Message sent successfully! I'll get back to you soon.", "success");
        form.reset();
    } catch (error) {
        console.error("Error:", error);
        showToast("Network error. Please check your connection and try again.", "network");
    }
}

function showToast(message: string, type: "error" | "success" | "network" = "error") {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    
    let borderColor = "border-red-500";
    let iconColor = "text-red-500";
    let titleColor = "text-red-800";
    let messageColor = "text-red-600";
    let title = "Validation Error";
    let iconSvg = `<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
    </svg>`;
    
    if (type === "success") {
        borderColor = "border-green-500";
        iconColor = "text-green-500";
        titleColor = "text-green-800";
        messageColor = "text-green-600";
        title = "Success";
        iconSvg = `<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>`;
    } else if (type === "network") {
        borderColor = "border-orange-500";
        iconColor = "text-orange-500";
        titleColor = "text-orange-800";
        messageColor = "text-orange-600";
        title = "Connection Error";
        iconSvg = `<svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>`;
    }

    toast.className = `
        transform transition-all duration-300 ease-out
        bg-white rounded-lg shadow-lg border-l-4 p-4
        flex items-start gap-3 w-full
        ${borderColor}
        animate-slide-down
    `;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");

    const icon = document.createElement("div");
    icon.className = "flex-shrink-0 mt-0.5";
    icon.innerHTML = iconSvg;

    const content = document.createElement("div");
    content.className = "flex-1 font-quicksand";
    
    const titleElement = document.createElement("div");
    titleElement.className = `font-semibold ${titleColor}`;
    titleElement.textContent = title;

    const messageText = document.createElement("div");
    messageText.className = `text-sm mt-1 ${messageColor}`;
    messageText.textContent = message;

    content.appendChild(titleElement);
    content.appendChild(messageText);

    const closeButton = document.createElement("button");
    closeButton.className = "flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors";
    closeButton.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
    </svg>`;
    closeButton.setAttribute("aria-label", "Close notification");
    closeButton.onclick = () => removeToast(toast);

    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(closeButton);

    toastContainer.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => removeToast(toast), 5000);
}


function removeToast(toast: HTMLElement) {
    toast.classList.add("opacity-0", "-translate-y-2");
    setTimeout(() => toast.remove(), 300);
}

function toastError(errors: string[]) {
    const errorMessage = errors.length === 1 
        ? errors[0]
        : `${errors.length} errors found:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
    
    showToast(errorMessage, "error");
}
