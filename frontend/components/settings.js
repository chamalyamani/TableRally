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
    this.initializeFriendList();
    this.initializeBlockedList();
  }

  async loadFriendsList() {
    const friendsListSection = this.shadowRoot.querySelector('#friendsListSection');
    const friendsGrid = friendsListSection.querySelector('.friends-grid');

    // Clear existing friends
    friendsGrid.innerHTML = '';

    try {
      const token = await getAccessToken();
      const response = await fetch('/friends/', { // Ensure this URL matches your backend routing
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        const friends = data.friends;
        if (friends.length === 0) {
          // Display centered message when no friends are present
          const noFriendsMsg = document.createElement('p');
          noFriendsMsg.textContent = 'No user have been added as friend yet.';
          noFriendsMsg.classList.add('centered-message');
          friendsGrid.appendChild(noFriendsMsg);
        } else {
          friends.forEach(friend => {
            // Create a new friend-card-settings element
            const friendCard = document.createElement('div');
            friendCard.classList.add('friend-card-settings');

            // Friend Avatar
            const avatarDiv = document.createElement('div');
            avatarDiv.classList.add('friend-avatar-settings');
            const avatarImg = document.createElement('img');
            avatarImg.src = friend.image_url;
            avatarImg.classList.add('friend-image-settings');
            avatarImg.alt = `${friend.username}'s avatar`;
            avatarDiv.appendChild(avatarImg);

            // Friend Name
            const nameDiv = document.createElement('div');
            nameDiv.classList.add('friend-name-settings');
            nameDiv.textContent = friend.username;

            // Friend Actions
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('friend-actions-settings');

            // Remove Button
            const removeBtn = document.createElement('button');
            removeBtn.classList.add('friend-action-settings', 'remove-btn');
            removeBtn.textContent = 'Remove';
            removeBtn.dataset.username = friend.username; // Store username for reference
            removeBtn.addEventListener('click', () => this.handleRemoveFriend(friend.username));

            // Block Button
            const blockBtn = document.createElement('button');
            blockBtn.classList.add('friend-action-settings', 'block-btn-friendLst');
            blockBtn.textContent = 'Block';
            blockBtn.dataset.username = friend.username; // Store username for reference
            blockBtn.addEventListener('click', () => this.handleBlockFriend(friend.username));

            actionsDiv.appendChild(removeBtn);
            actionsDiv.appendChild(blockBtn);

            // Assemble the friend card
            friendCard.appendChild(avatarDiv);
            friendCard.appendChild(nameDiv);
            friendCard.appendChild(actionsDiv);

            // Add the friend card to the grid
            friendsGrid.appendChild(friendCard);
          });
        }
      } else {
        globalNotifPopup('Error', data.error || 'Failed to load friends list');
      }
    } catch (error) {
      globalNotifPopup('Error', error.message);
    }
  }

  async handleRemoveFriend(username) {
    const confirmRemove = confirm(`Are you sure you want to remove ${username} as a friend?`);
    if (!confirmRemove) return;

    try {
      const token = await getAccessToken();
      const response = await fetch(`friends/remove/${username}/`, { // Ensure this URL matches your backend routing
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        globalNotifPopup('Success', data.message || 'Friend removed successfully');
        // Reload the friends list to reflect changes
        await this.loadFriendsList();
      } else {
        globalNotifPopup('Error', data.error || 'Failed to remove friend');
      }
    } catch (error) {
      globalNotifPopup('Error', error.message);
    }
  }

  async handleBlockFriend(username) {
    const confirmBlock = confirm(`Are you sure you want to block ${username}? This will remove them from your friends list.`);
    if (!confirmBlock) return;

    try {
      const token = await getAccessToken();
      const response = await fetch(`friends/${username}/block/`, { // Ensure this URL matches your backend routing
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        globalNotifPopup('Success', data.message || 'User blocked successfully');
        // Reload the friends list to reflect changes
        await this.loadFriendsList();
      } else {
        globalNotifPopup('Error', data.error || 'Failed to block user');
      }
    } catch (error) {
      globalNotifPopup('Error', error.message);
    }
  }

  initializeFriendList() {
    const friendsListButton = this.shadowRoot.querySelector('#friendsListButton');
  
    friendsListButton.addEventListener('click', async () => {
      await this.loadFriendsList(this.shadowRoot);
    });
  }

  async loadBlockedUsersList() {
    const blockListSection = this.shadowRoot.querySelector('#blockListSection');
    const blockedGrid = blockListSection.querySelector('.blocked-grid');
  
    // Clear existing blocked users
    blockedGrid.innerHTML = '';
  
    try {
      const token = await getAccessToken();
      const response = await fetch('friends/blocked/', { // Ensure this URL matches your backend routing
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const blockedUsers = data.blocked_users;
        if (blockedUsers.length === 0) {
          const noBlockedMsg = document.createElement('p');
          noBlockedMsg.textContent = 'No users have been blocked.';
          noBlockedMsg.classList.add('centered-message');
          blockedGrid.appendChild(noBlockedMsg);
        } else {
          blockedUsers.forEach(user => {
            // Create a new blocked-card element
            const blockedCard = document.createElement('div');
            blockedCard.classList.add('blocked-card');
  
            // Blocked Avatar
            const avatarDiv = document.createElement('div');
            avatarDiv.classList.add('blocked-avatar');
            const avatarImg = document.createElement('img');
            avatarImg.src = user.image_url || '/default-avatar.png';
            avatarImg.classList.add('blocked-image');
            avatarImg.alt = `${user.username}'s avatar`;
            avatarDiv.appendChild(avatarImg);
  
            // Blocked Name
            const nameDiv = document.createElement('div');
            nameDiv.classList.add('blocked-name');
            nameDiv.textContent = user.username;
  
            // Blocked Actions
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('blocked-actions');
  
            // Unblock Button
            const unblockBtn = document.createElement('button');
            unblockBtn.classList.add('blocked-action', 'unb-btn');
            unblockBtn.textContent = 'Unblock';
            unblockBtn.dataset.username = user.username; // Store username for reference
            unblockBtn.addEventListener('click', () => this.handleUnblockUser(user.username));
  
            actionsDiv.appendChild(unblockBtn);
  
            // Assemble the blocked card
            blockedCard.appendChild(avatarDiv);
            blockedCard.appendChild(nameDiv);
            blockedCard.appendChild(actionsDiv);
  
            // Add the blocked card to the grid
            blockedGrid.appendChild(blockedCard);
          });
        }
  
        // Show the blocked list section
      } else {
        globalNotifPopup('Error', data.error || 'Failed to load blocked users list');
      }
    } catch (error) {
      globalNotifPopup('Error', error.message);
    }
  }

  async handleUnblockUser(username) {
    const confirmUnblock = confirm(`Are you sure you want to unblock ${username}?`);
    if (!confirmUnblock) return;
  
    try {
      const token = await getAccessToken();
      const response = await fetch(`friends/${username}/unblock/`, { // Ensure this URL matches your backend routing
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        globalNotifPopup('Success', data.message || 'User unblocked successfully');
        // Reload the blocked users list to reflect changes
        await this.loadBlockedUsersList(this.shadowRoot);
      } else {
        globalNotifPopup('Error', data.error || 'Failed to unblock user');
      }
    } catch (error) {
      globalNotifPopup('Error', error.message);
    }
  }

  initializeBlockedList() {
    const blockListButton = this.shadowRoot.querySelector('#blockListButton');
  
    blockListButton.addEventListener('click', async () => {
      const blockListSection = this.shadowRoot.querySelector('#blockListSection');
      await this.loadBlockedUsersList(this.shadowRoot);
    });
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
    this.downloadDataProcess();
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

  downloadUserData(token) {
    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    const userDataPromise = fetch('/user/download-data/', {
      method: 'GET',
      headers: headers,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json(); // Assuming the endpoint returns JSON
      });

    const gameStatePromise = fetch('/gamesByWinId/', {
      method: 'GET',
      headers: headers,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch game state data');
        }
        return response.json();
      });

    // const pongStatePromise = fetch('/api/', {
    //   method: 'GET',
    //   headers: headers,
    // })
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error('Failed to fetch game state data');
    //     }
    //     return response.json();
    //   });
      
    Promise.all([userDataPromise, gameStatePromise])
      .then(([userData, gameState]) => {
        const combinedData = {
          userData: userData,
          gameState: gameState,
        };
        const dataStr = JSON.stringify(combinedData, null, 2); // Pretty-print with 2-space indentation
        const blob = new Blob([dataStr], { type: 'application/json' });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = userData.username + '_data.json';

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        globalNotifPopup('Success', 'Your data downloaded successfully!');
      })
      .catch(error => {
        // Handle any errors that occurred during the fetches or processing
        console.error('Error downloading your data:', error);
        globalNotifPopup('Error', error.message || 'An error occurred while downloading data.');
      });
  }

  async downloadDataProcess()
  {
    const toggleSwitch = this.shadowRoot.querySelector("#toggleSwitchDData");
    const tok = await getAccessToken(); 
    if (toggleSwitch) 
    {
      toggleSwitch.addEventListener("change", () => {
        if(toggleSwitch.checked)
            this.downloadUserData(tok);
        else
          toggleSwitch.checked = false;
      });
    }
  }
}

customElements.define("settings-page", SettingsPage);


