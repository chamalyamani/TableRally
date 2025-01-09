import { globalNotifPopup } from "../shared.js"; 

class SignUpPage extends HTMLElement 
{
  constructor() 
{
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("signup-template");
    const content = template.content.cloneNode(true);

    shadow.appendChild(content);

    // Lien vers le fichier CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "styles/signup.css";

    link.onload = () => 
    {
      this.style.display = "block";
    };

    shadow.appendChild(link);


    this.style.display = "none";
  }

  connectedCallback() 
  {
    this.shadowRoot.querySelectorAll("[data-navigate]").forEach((element) => 
      {
      element.addEventListener("click", (e) => 
      {
        const page = e.target.dataset.navigate;
        if (page) 
        {
          navigateTo(page);
        }
      });
    });
    // Ajouter des listeners pour la navigation
    this.signupProcess();
    // window.addEventListener("resize", this.handleResize.bind(this));
    // this.handleResize();
  }
  handleResize() 
  {
    const mobileMessage = this.shadowRoot.querySelector("#mobile-message");
    if (window.innerWidth < 1400) 
    {
      mobileMessage.style.display = "flex";
    } 
    else 
    {
      mobileMessage.style.display = "none";
    }
  }

  disconnectedCallback() {
    // Nettoyage de l'écouteur d'événement lors de la suppression du composant
    // window.removeEventListener("resize", this.handleResize.bind(this));
  }

  signupProcess() {

    const registerForm = this.shadowRoot.getElementById("registerForm");

    registerForm.addEventListener("submit", async (e) => 
    {
        e.preventDefault();
  
        const formData = {
          username: this.shadowRoot.getElementById("registerUsername").value,
          first_name: this.shadowRoot.getElementById("firstname").value,
          last_name: this.shadowRoot.getElementById("lastname").value,
          username: this.shadowRoot.getElementById("registerUsername").value,
          email: this.shadowRoot.getElementById("email").value,
          password: this.shadowRoot.getElementById("registerPassword").value,
          confirm_password: this.shadowRoot.getElementById("registerConfirm_password").value,
        };
  
        try {
          const response = await fetch("/auth/register/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
            credentials: "include",
          });
        
          if (!response.ok) {
            const errors = await response.json();
            for (const [field, messages] of Object.entries(errors)) {
              globalNotifPopup("Error", messages[0]);
            }
          } else {
            const data = await response.json();
            globalNotifPopup("Success", data.message);
            navigateTo("login");
          }
        } catch (err) {
          globalNotifPopup("Error", "Internal server error occured!");
        }
      });
  }
}

// Déclarer le Web Component globalement
customElements.define("signup-page", SignUpPage);

  