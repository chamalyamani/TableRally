import { globalNotifPopup } from "../shared.js"; 

class ResetPasswordPage extends HTMLElement 
{
    constructor() 
    {
      super();
  
    const shadow = this.attachShadow({ mode: "open" });

  
      const template = document.getElementById("resetpassword-template");
      const content = template.content.cloneNode(true);
  

      shadow.appendChild(content);
  
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "styles/resetpassword.css";
  
      link.onload = () => 
      {
        this.style.display = "block";
      };
  
      shadow.appendChild(link);
      this.style.display = "none";
  
    }
  
    connectedCallback() 
    {
      this.shadowRoot.querySelectorAll("[data-navigate]").forEach((element) => {
        element.addEventListener("click", (e) => {
          const page = e.target.dataset.navigate;
          if (page) 
          {
            navigateTo(page);
          }
        });
      });
      this.resetPassword();
      window.addEventListener("resize", this.handleResize.bind(this));
      this.handleResize();
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
        mobileMessage.style.display = "none"

      }
    }

    disconnectedCallback() {
      // Nettoyage de l'écouteur d'événement lors de la suppression du composant
      window.removeEventListener("resize", this.handleResize.bind(this));
    }

    getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
          cookie = cookie.trim();
          if (cookie.startsWith(name + "=")) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }

    async fetchCsrfToken() {
      try {
        const response = await fetch('/user/get-csrf-token/', {
          method: 'GET',
          credentials: 'include', // Ensure cookies are included with the request
        });
    
        if (!response.ok) {
          globalNotifPopup("Error", "internal server error");
        }
    
        const data = await response.json();
        return data.csrfToken;
      } catch (error) {
        return null;
      }
    }
    

    resetPassword() {
      const form = this.shadowRoot.getElementById("passwordResetForm");
      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();

          const email = this.shadowRoot.getElementById("passwordResetEmail").value;
          if (!email) {
            globalNotifPopup("Error", "Please enter an email address.");
            return;
          }
          let csrfToken = this.getCookie("csrftoken");
          
          if (!csrfToken) {
            csrfToken = await this.fetchCsrfToken();
          }
    
          const formData = new URLSearchParams();
          formData.append("email", email);
          formData.append("csrfmiddlewaretoken", csrfToken);
    
          fetch("/user/password_reset/", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-CSRFToken": csrfToken,
            },
            body: formData.toString(),
            credentials: "include",
          })
            .then((response) => {
              if (response.ok) {
                globalNotifPopup("Sent", "Check your email to set your new password!");
                navigateTo("login");
              } 
              else {
               globalNotifPopup("Error", "Failed to send reset link.");
              }
            })
            .catch((error) => globalNotifPopup("Error", error));
        });
      }
    }
  }
  
customElements.define("resetpassword-page", ResetPasswordPage);