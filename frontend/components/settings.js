import { globalNotifPopup, updateActiveNav } from "../shared.js";
import { initializeCommonScripts } from "../shared.js";
import { getUserInfos } from "../shared.js";
import { getAccessToken } from "../shared.js";
import { logoutProcess } from "../shared.js";


class SettingsPage extends HTMLElement 
{
  constructor() 
  {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const template = document.getElementById("settings-template");
    const content = template.content.cloneNode(true);

    shadow.appendChild(content);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "styles/settings.css";

    this.style.display = "none";

    link.onload = () => {
      this.style.display = "block";
    };

    shadow.appendChild(link);
  }

  connectedCallback() 
  {
    updateActiveNav("settings", this.shadowRoot);
    initializeCommonScripts(this.shadowRoot);

    // Navigation logic
    this.shadowRoot.querySelectorAll("[data-navigate]").forEach((element) => {
      element.addEventListener("click", (e) => {
        const page = e.target.dataset.navigate;
        if (page) 
        {
          navigateTo(page);
        }
      });
    });

    // Appeler la logique spécifique pour Two-Factor Section
    this.initializeTwoFactorSection();
    this.settingsProcess();
    window.addEventListener("resize", this.handleResize.bind(this));
    this.handleResize();
    this.setupSectionNavigation();
  }

  setupSectionNavigation() 
  {
    const buttons = this.shadowRoot.querySelectorAll(".nav-button");
    const sections = this.shadowRoot.querySelectorAll(".settings-section");

    // Ajouter un événement à chaque bouton
    buttons.forEach((button) => 
    {
      button.addEventListener("click", (event) => 
      {
        const activeButtonId = button.id;

        // Mettre à jour les boutons
        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Mettre à jour les sections
        sections.forEach((section) => 
        {
          if (section.id === activeButtonId.replace("Button", "Section")) 
          {
            section.classList.remove("hidden"); // Afficher la section active
          } 
          else 
          {            
            section.classList.add("hidden"); // Masquer les autres sections
          }
        });
      });
    });

    // Par défaut, activer la section "General"
    this.shadowRoot.querySelector("#generalButton").classList.add("active");
    this.shadowRoot.querySelector("#generalSection").classList.remove("hidden");
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

  async settingsProcess() 
  {
    getUserInfos(this.shadowRoot);
    this.deleteAcoount(this.shadowRoot);
    this.updateData(this.shadowRoot);
    this.logoutListener();
    this.anonymizationProcess();
  }

  async fetch2FAStatus() {
    try {
      const tok = await getAccessToken();
      const response = await fetch('/auth/check-2fa-status/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tok}`
        }
      });
  
      if (!response.ok) {
        globalNotifPopup("Error", "internal server error");
        return false;
      }
      const data = await response.json();
      return data.two_fa_enabled;
    } 
    catch (error) {
      return false;
    }
  }

  deleteAcoount()
  {
    this.shadowRoot.getElementById('deleteAccountBtn').addEventListener('click', function() {
      if (confirm("Are you sure you want to delete your account?")) {
          getAccessToken()
          .then(accessToken => {
              return fetch('/user/delete-account/', {
                  method: 'DELETE',
                  credentials: 'include',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${accessToken}`
                  }
              });
          })
          .then(response => {
              if (response.ok) {
                  globalNotifPopup("Success", "Account deleted successfully.");
                  navigateTo("login");
              } else {
                  return response.json().then(data => {
                    globalNotifPopup("Error", data.error || 'Failed to delete account.');
                  });
              }
          })
          .catch(error => {
            globalNotifPopup("Error", error || "Error deleting account:" );
          });
      }
    });
  }

  updateData()
  {
    this.shadowRoot.getElementById('fileInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']; // Allowed MIME types
          if (!allowedTypes.includes(file.type)) {
            globalNotifPopup("Error", "File type not supported");
            e.target.value = ""; // Clear the file input to reset
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            this.shadowRoot.getElementById('settingsImage').src = e.target.result;  // Update profile picture preview
          }
          reader.readAsDataURL(file);
      }
    });
    
    this.shadowRoot.getElementById("saveChangesBtn").addEventListener('click', (e) => {
      const username = this.shadowRoot.getElementById('settingsUN').value;
      const first_name = this.shadowRoot.getElementById('settingsFN').value;
      const last_name = this.shadowRoot.getElementById('settingsLN').value;
      const email = this.shadowRoot.getElementById('settingsEM').value;
      const image = this.shadowRoot.getElementById('fileInput').files[0] || null;
      const OldPassword = this.shadowRoot.getElementById('settingsOldP').value;
      const password = this.shadowRoot.getElementById('settingsNewP').value;
      const confirm_password = this.shadowRoot.getElementById('settingsNewConfirmP').value;
      
      const formData = new FormData();
      formData.append('username', username);
      formData.append('first_name', first_name);
      formData.append('last_name', last_name);
      formData.append('email', email);
      formData.append('OldPassword', OldPassword);
      formData.append('password', password);
      formData.append('confirm_password', confirm_password);
      if (image)
          formData.append('image', image);
  
      // Send the updated data to the server
      getAccessToken()
      .then(accessToken => {
          return fetch('/user/update-profile/', {
              method: 'PUT',
              credentials: 'include',  // Include cookies for authentication
              headers: {
                  Authorization: `Bearer ${accessToken}`
              },
              body: formData,
          });
      })
      .then(response => response.json())
      .then(data => {
          if (data.error) {
            globalNotifPopup("Error", data.error);
          } else {
            // appState.image = 
            globalNotifPopup("Success", "Profile data changed successfully!");
            navigateTo("settings");
          }
      })
      .catch(error => {
        globalNotifPopup("Error", "Error updating profile: File too large");
      });
    })
  }

  enable2FA()
  {
    getAccessToken()
    .then(accessToken => {
        return fetch('/auth/enable-2fa/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${accessToken}`  // Set Authorization header
            }
        });
    })
    .then(response => response.json())
    .then(data => {
        if (data.qr_code) {
          this.shadowRoot.getElementById('qrCodeImg').src = data.qr_code;
          window.temporaryToken = data.temporary_token;
        } else {
            globalNotifPopup("Error", data.error || 'Failed to activate 2fa.');
        }
    })
    .catch(error => globalNotifPopup("Error", error));
  }

  disable2FA() {
    getAccessToken()
    .then(accessToken => {
        return fetch('/auth/disable-2fa/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })})
    .then(response => response.json())
    .then(data => {
        if (data.success) {
          globalNotifPopup("Success", "2FA disabled successfully");
        } else {
            globalNotifPopup("Error", 'Failed to activate 2fa.');
        }
    })
    .catch(error => console.error('Error disabling 2FA:', error));
  }

  logoutListener()
  {
    this.shadowRoot.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      logoutProcess();
    })
  }

  check2FATOken(val)
  {
    fetch('/auth/verify-2fa/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            temporary_token: window.temporaryToken,  // Use the stored temporary token
            two_fa_token: val
        }),
        credentials: 'include' // Include cookies for authentication
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
          globalNotifPopup("Error", data.error);
        }
          else {
            globalNotifPopup("Success", '2FA enabled successfully!');
            this.shadowRoot.querySelector("#settingsContainer").classList.remove("scrollable");
            this.shadowRoot.querySelector("#extraContent").classList.remove("visible");
        }
    })
    .catch(error => globalNotifPopup('Error', error));
  }

  async initializeTwoFactorSection() {
    const toggleSwitch = this.shadowRoot.querySelector("#toggleSwitch2FA");
    const settingsContainer = this.shadowRoot.querySelector("#settingsContainer");
    const extraContent = this.shadowRoot.querySelector("#extraContent");

    const is2FAEnabled = await this.fetch2FAStatus();

    if (toggleSwitch) {
        if (is2FAEnabled) {
          toggleSwitch.checked = true;
        } 
        else {
            toggleSwitch.checked = false;
        }
        toggleSwitch.addEventListener("change", () => {
            if (toggleSwitch.checked) {
                // Rendre le conteneur défilable et afficher le contenu supplémentaire
                settingsContainer.classList.add("scrollable");
                extraContent.classList.add("visible");

                // Défilement automatique vers la section supplémentaire
                setTimeout(() => {
                    settingsContainer.scrollTo({
                        top: settingsContainer.scrollHeight,
                        behavior: "smooth"
                    });
                }, 300); // Attendre l'affichage fluide

                this.enable2FA();

                this.shadowRoot.getElementById('submit2FATokenSetup').addEventListener('click', (e) => {
                  const twoFaToken = this.shadowRoot.getElementById('2faTokenInputSetup').value;
                  if(!twoFaToken)
                  {
                    globalNotifPopup("Error", 'No token given');
                    return;
                  }
                  this.check2FATOken(twoFaToken);
                })

            } else {
                // Désactiver le défilement et masquer le contenu supplémentaire
                settingsContainer.classList.remove("scrollable");
                extraContent.classList.remove("visible");

                // Retourner au haut du conteneur
                settingsContainer.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
                
                this.disable2FA();
            }
        });
    }
  }
  
  anonymizeData(tok)
  {
    fetch('/user/anonymize/', {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tok}`
      }
      })
      .then(response => response.json())
      .then(data => {
          if (data.error) {
            globalNotifPopup("Error", data.error);
          }
            else {
              globalNotifPopup("Success", data.message);
          }
      })
      .catch(error => globalNotifPopup("Error ", error));
  }

  unanonymizeData(tok)
  {
    fetch('/user/unanonymize/', {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tok}`
      }
      })
      .then(response => response.json())
      .then(data => {
          if (data.error) {
            globalNotifPopup("Error", data.error);
          }
            else {
              globalNotifPopup("Success", data.message);
          }
      })
      .catch(error => globalNotifPopup("Error ", error));
  }

  async anonymizationStatus(tok)
  {
    try {
      const tok = await getAccessToken();
      const response = await fetch('/user/anonymization-status/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tok}`
        }
      });
  
      if (!response.ok) {
        globalNotifPopup("Error", "internal server error");
        return false;
      }
      const data = await response.json();
      return data.status;
    } 
    catch (error) {
      globalNotifPopup("Error", "Network error occurred while checking anonymization status.");
      return false;
    }
  }

  async anonymizationProcess()
  {
    const toggleSwitch = this.shadowRoot.querySelector("#toggleSwitchAnonym");
    const tok = await getAccessToken(); 
    let isAnonymizeEnabled = await this.anonymizationStatus(tok);
    if (toggleSwitch) {
      if (isAnonymizeEnabled) {
        console.log("-->", isAnonymizeEnabled);
        toggleSwitch.checked = true;
      }
      else {
          toggleSwitch.checked = false;
      }
      toggleSwitch.addEventListener("change", () => {
        if(toggleSwitch.checked)
            this.anonymizeData(tok);
        else
          this.unanonymizeData(tok);
      });
    }
  }
}

customElements.define("settings-page", SettingsPage);
