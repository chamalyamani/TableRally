import { updateActiveNav } from "../shared.js";
import { initializeCommonScripts } from "../shared.js";
import { getUserInfos } from "../shared.js";
import { logoutProcess } from "../shared.js";




class DashboardPage extends HTMLElement 
{
    constructor() 
    {
      super();
  
      const shadow = this.attachShadow({ mode: "open" });
  

      const template = document.getElementById("dashboard-template");
      const content = template.content.cloneNode(true);
  
      shadow.appendChild(content);
  
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "styles/dashboard.css";
  
      this.style.display = "none";
  
      link.onload = () => 
      {
        this.style.display = "block";
      };
  
      shadow.appendChild(link);
    }
    
    async connectedCallback() 
    {
      updateActiveNav("dashboard", this.shadowRoot);
      initializeCommonScripts(this.shadowRoot);
      this.shadowRoot.querySelectorAll("[data-navigate]").forEach((element) => {
        element.addEventListener("click", (e) => {
          const page = e.target.dataset.navigate;
          if (page) 
          {
            navigateTo(page);
          }
        });
      });

      // const response = await this.checkAuthStatus();

      // if (response) {
      //     if(response.temporary_token)
      //         navigateTo("authentication");
      //     else
      //       navigateTo("dashboard");
      // } 
      // else {
      //     alert("NOOOOOOOOOOO , ", window.location.pathname);
      //     // this.loginProcess();
      // }
      // await this.handleOAuthCallback();
      this.dashboardProcess();
      window.addEventListener("resize", this.handleResize.bind(this));
      this.handleResize();
    }
    
      handleResize() 
      {
        const mobileMessage = this.shadowRoot.querySelector("#mobile-message");
        
        if (window.innerWidth < 1550) 
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

    logoutListener()
    {
      this.shadowRoot.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logoutProcess();
      })
    }

    async checkAuthStatus() {
      try {
          const response = await fetch('/auth/callback/', {
              method: 'GET',
              credentials: 'include',
              headers: {
                  'Content-Type': 'application/json',
              },
          });
  
          if (response.ok) {
              const data = await response.json();
              if(data.temporary_token)
                navigateTo("authentication");
              else
                navigateTo("dashboard");
              return data;
          }
          return false;
      } catch (error) {
          return false;
      }
    }

    async dashboardProcess() 
    {
      getUserInfos(this.shadowRoot);
      this.logoutListener();
    }

}
  
customElements.define("dashboard-page", DashboardPage);
