import { globalNotifPopup } from "../shared.js"; 


class AuthentificationPage extends HTMLElement 
{
    constructor() 
    {
      super();
  
      const shadow = this.attachShadow({ mode: "open" });
  

      const template = document.getElementById("authentification-template");
      const content = template.content.cloneNode(true);
  
      shadow.appendChild(content);
  
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "styles/authentification.css";
  
      this.style.display = "none";
  
      link.onload = () => 
      {
        this.style.display = "block";
      };
  
      shadow.appendChild(link);
    }
    connectedCallback() 
    {
      this.checkSubmitted2FAToken();
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
        mobileMessage.style.display = "none";
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

    async fetchTempToken() {
      try {
        const response = await fetch('/user/get-temporary-token/', {
          method: 'GET',
          credentials: 'include', // Ensure cookies are included with the request
        });
    
        if (!response.ok) {
          globalNotifPopup("Error", "internal server error");
        }
    
        const data = await response.json();
        return data.temporary_token;
      } catch (error) {
        return null;
      }
    }

    checkSubmitted2FAToken()
    {
      this.shadowRoot.getElementById('2FAFormCheker').addEventListener('submit', async (e) => {
        e.preventDefault();
        const twoFaToken = this.shadowRoot.getElementById('2faTokenAfterLogin').value;
        let temp_tok = await this.fetchTempToken();
        fetch('/auth/verify-2fa-old/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            temporary_token: temp_tok,
            two_fa_token: twoFaToken
          }),
          credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            globalNotifPopup("Error", data.error);
          } else {
                navigateTo("dashboard");
                globalNotifPopup("Success", "Welcome Back " + data.username);
            } 
        })
        .catch(error => globalNotifPopup('Error', error));
    });
    }

}
  
customElements.define("authentification-page", AuthentificationPage);