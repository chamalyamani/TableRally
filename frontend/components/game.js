import { updateActiveNav } from "../shared.js";
import { initializeCommonScripts } from "../shared.js";
import { getUserInfos } from "../shared.js";
import { logoutProcess } from "../shared.js";

class GamePage extends HTMLElement 
{
    constructor() 
    {
      super();
  
      const shadow = this.attachShadow({ mode: "open" });
  

      const template = document.getElementById("game-template");
      const content = template.content.cloneNode(true);
  
      shadow.appendChild(content);
  
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "styles/game.css";
  
      this.style.display = "none";
  
      link.onload = () => 
      {
        this.style.display = "block";
      };
  
      shadow.appendChild(link);
    }
    connectedCallback() 
    {
      updateActiveNav("game", this.shadowRoot);
      initializeCommonScripts(this.shadowRoot);
      this.shadowRoot.querySelectorAll("[data-navigate]").forEach((element) => 
      {
        element.addEventListener("click", (e) => {
          const page = e.target.dataset.navigate;
          if (page) 
          {
            navigateTo(page);
          }
        });
      });
      this.gameProcess();
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

    async gameProcess() 
    {
      getUserInfos(this.shadowRoot);
      this.logoutListener();
    }

}
  
customElements.define("game-page", GamePage);
  