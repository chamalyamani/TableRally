import { getAccessToken } from "../shared.js"; 
import { globalNotifPopup } from "../shared.js"; 

const appState = {
  username: "",
  profileImage: "",
};

class LoginPage extends HTMLElement 
{
  constructor() 
  {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("login-template");
    const content = template.content.cloneNode(true);

    shadow.appendChild(content);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "styles/login.css";

    link.onload = () => 
    {
      this.style.display = "block";
    };

    shadow.appendChild(link);
    this.style.display = "none";
  }

  async connectedCallback() 
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
    
    this.loginProcess();
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
    window.removeEventListener("resize", this.handleResize.bind(this));
  }
  
  handleLoginResponse(data) 
  {
    if (data.error) {
      globalNotifPopup("Error", data.error);
    } 
    else if (data.temporary_token) {
      navigateTo("authentification");
    }
    else {
      // localStorage.removeItem('alertShown');
      appState.username = data.username;
      appState.profileImage = data.image;
      globalNotifPopup("Success", "Welcome Back " + data.username);
      navigateTo("dashboard");
    }
  }

  loginProcess() 
  {
      const loginForm = this.shadowRoot.getElementById("loginForm");
      const login42Btn = this.shadowRoot.getElementById("login42Btn");
      
      if (loginForm) {
        loginForm.addEventListener("submit",  (e) => {
          e.preventDefault();
    
          const username = this.shadowRoot.getElementById("username").value;
          const password = this.shadowRoot.getElementById("password").value;

          // Make a POST request to log in
          fetch("/auth/login/credentials/", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            credentials: "include",
            body: new URLSearchParams({
              username: username,
              password: password,
            }),
          })
          .then((response) => response.json())
          .then((data) => {
            if (data.redirect_to) {
              window.location.href = data.redirect_to;
            } else {
              this.handleLoginResponse(data);
            }
          })
          .catch((error) => {
            globalNotifPopup("Error", "Login Error: " + error);
            console.error("Login Error:", error);
          });
        });
      }
      if (login42Btn) {
        login42Btn.addEventListener("click", async (e) => {
          e.preventDefault();
          localStorage.setItem('authFetchRequired', 'true');
          window.location.href = '/auth/login/42-intra';
        });
      }
    }
  }

customElements.define("login-page", LoginPage);

  
  
  