import getElement from "../../utils/getElement";

interface ContactFormStatus {
    nameValid: boolean;
    emailValid:boolean;
    messageValid:boolean;
}


export default function setupContactForm () {
    const form = getElement("contact-form", HTMLFormElement);
    const nameInput = getElement("form-contact-name", HTMLInputElement);
    const nameInputLabel = getElement("form-contact-name-label", HTMLLabelElement);
    const emailInput = getElement("form-contact-email", HTMLInputElement);
    const emailInputLabel = getElement("form-contact-email-label", HTMLLabelElement);
    const messageInput = getElement("form-contact-message", HTMLTextAreaElement);
    const messageInputLabel = getElement("form-contact-message-label",HTMLLabelElement);
    form.addEventListener("submit", async(e)=>{
        e.preventDefault();
        nameInputLabel.classList.remove("error");
        emailInputLabel.classList.remove("error");
        messageInputLabel.classList.remove("error");
        const formStatus:ContactFormStatus = {
            nameValid:true,
            emailValid:true,
            messageValid:true
        }
        const errorsList:string[] = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const formData = new FormData(form);
        const name = (formData.get("form-contact-name") as string).trim();
        const email = (formData.get("form-contact-email") as string).trim();
        const message = (formData.get("form-contact-message") as string).trim();
        // Additional validation
        if (name.length < 2) {
            errorsList.push("Please enter a valid name (at least 2 characters)");
            formStatus.nameValid = false;
        }
        if (!emailRegex.test(email)) {
            errorsList.push("Please enter a valid email address");
            formStatus.emailValid = false;
        }
        if (message.length < 10) {
            errorsList.push("Enter a valid message.")
            formStatus.messageValid = false;
        }

        if (formStatus.emailValid && formStatus.messageValid && formStatus.nameValid) {
            alert("WELL DONE!");
        } else {
            !formStatus.nameValid && nameInputLabel.classList.add("error");
            !formStatus.emailValid && emailInputLabel.classList.add("error");
            !formStatus.messageValid && messageInputLabel.classList.add("error");
            toastError(errorsList);
        }
    })
}


function toastError(errors:string[]) {
    alert("BAD!!!")
}