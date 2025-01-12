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
      this.loadHistory();
    }

    async loadHistory() {
      // Get the containers for wins and losses from the shadow DOM
      const winsContainer = this.shadowRoot.querySelector('#history-list-wins');
      const lossesContainer = this.shadowRoot.querySelector('#history-list-losses');
      
      if (!winsContainer || !lossesContainer) {
        console.error("Wins and/or losses container not found");
        return;
      }
      
      // Clear existing content
      winsContainer.innerHTML = '';
      lossesContainer.innerHTML = '';
      
      try {
        const token = await getAccessToken();
        const response = await fetch('/api/player-games/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error('Failed to fetch history:', response.statusText);
          return;
        }
        
        const data = await response.json();
        const games = data; // assuming the API returns this key
        
        if (games.length === 0) {
          // Display centered messages if no games exist
          if (games.length === 0) {
            const noWinsMsg = document.createElement('p');
            noWinsMsg.textContent = 'No wins';
            noWinsMsg.classList.add('centered-message');
            winsContainer.appendChild(noWinsMsg);
          
            const noLossesMsg = document.createElement('p');
            noLossesMsg.textContent = 'No losses';
            noLossesMsg.classList.add('centered-message');
            lossesContainer.appendChild(noLossesMsg);
          } else {
            // Process each game and append to winsContainer or lossesContainer
            games.forEach(game => {
              // ... (existing code to create each history-item) ...
              // Assuming game.score1 is this.user's score and game.score2 is the opponent's
              if (game.score1 > game.score2) {
                winsContainer.appendChild(historyItem);
              } else {
                lossesContainer.appendChild(historyItem);
              }
            });
          
            // If after processing, one of the containers remains empty, add the message.
            if (winsContainer.children.length === 0) {
              const noWinsMsg = document.createElement('p');
              noWinsMsg.textContent = 'No wins';
              noWinsMsg.classList.add('centered-message');
              winsContainer.appendChild(noWinsMsg);
            }
            if (lossesContainer.children.length === 0) {
              const noLossesMsg = document.createElement('p');
              noLossesMsg.textContent = 'No losses';
              noLossesMsg.classList.add('centered-message');
              lossesContainer.appendChild(noLossesMsg);
            }
          }
          
        } else {
          games.forEach(async game =>{
            // Create history-item
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            
            // Create history-left (this user's info)
            const historyLeft = document.createElement('div');
            historyLeft.classList.add('history-left');
            const leftImg = document.createElement('img');
            leftImg.src = game.player1_image;
            const leftName = document.createElement('span');
            leftName.classList.add('player-name');
            leftName.textContent = game.player1_username;
            historyLeft.appendChild(leftImg);
            historyLeft.appendChild(leftName);
            
            // Create history-center (score)
            const historyCenter = document.createElement('div');
            historyCenter.classList.add('history-center');
            const centerScore = document.createElement('span');
            centerScore.classList.add('history-score');
            centerScore.textContent = `${game.score1} : ${game.score2}`;
            historyCenter.appendChild(centerScore);
            
            // Create history-right (opponent info)
            const historyRight = document.createElement('div');
            historyRight.classList.add('history-right');
            const rightName = document.createElement('span');
            rightName.classList.add('player-name');
            rightName.textContent = game.player2_username;
            const rightImg = document.createElement('img');
            rightImg.src = game.player2_image;
            historyRight.appendChild(rightName);
            historyRight.appendChild(rightImg);
            
            // Assemble the history item
            historyItem.appendChild(historyLeft);
            historyItem.appendChild(historyCenter);
            historyItem.appendChild(historyRight);
            
            if (game.winner) {
              winsContainer.appendChild(historyItem);
            } else {
              lossesContainer.appendChild(historyItem);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    }
    
    

}
  
customElements.define("dashboard-page", DashboardPage);
