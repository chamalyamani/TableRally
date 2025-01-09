export function updateActiveNav(page, shadowRoot) 
{
  const navElements = shadowRoot.querySelectorAll('.nav-element');

  navElements.forEach(navElement => 
    {
    const img = navElement.querySelector('img');
    const navigateTo = img ? img.dataset.navigate : navElement.dataset.navigate;


    if (!navigateTo) {
    //   console.warn("Attribut data-navigate manquant pour un élément.");
      return;
    }

    if (navigateTo === page) 
    {
      navElement.classList.add('active');
      // console.log(`Ajout de la classe active à : ${navigateTo}`);
    }
    else 
    {
      navElement.classList.remove('active');
    }
  });
}

export  function searchBarProcess(shadowRoot)
{
  // Gestion de la boîte de recherche
  const searchBox = shadowRoot.querySelector('.input-search');
  const searchButton = shadowRoot.querySelector('.button-search');
  const dropdownSearch = shadowRoot.querySelector('.dropdown-search');
  const dropdownResults = shadowRoot.querySelector('.dropdown-results');

  if (searchBox && searchButton)
    {
    // Événement : agrandir la barre de recherche
      searchButton.addEventListener('click', () => {
      searchBox.classList.add('active');
      searchBox.focus();
      dropdownSearch.style.display = 'block';
    });

    // Événement : réduire la barre de recherche lorsque le focus est perdu
    searchBox.addEventListener('blur', () => {
      searchBox.classList.remove('active'); // Réduire
      searchBox.value = ''; // Effacer
      setTimeout(() => {
        dropdownSearch.style.display = 'none'; // Cacher le dropdown après une courte pause
      }, 150); // Donne un délai pour permettre un clic dans le dropdown
    });

    // Événement : affichage dynamique du dropdown selon la saisie
    searchBox.addEventListener('input', async () => {
      const query = searchBox.value.trim();
      if (query !== '') {
        dropdownSearch.style.display = 'block'; // Afficher le dropdown si l'utilisateur tape quelque chose
        try {
          // Fetch results from the server
          const token = await getAccessToken();
          const response = await fetch(`/user/search/?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // Add Authorization header
            }
          });
          if (response.ok) {
            const results = await response.json(); // Assuming the response is JSON
            
            // Clear existing results
            dropdownResults.innerHTML = '';
  
            // Check if there are results
            if (results.length > 0) {
              results.forEach(result => {
                // Create a new list item for each result
                const li = document.createElement('li');
                li.classList.add('dropdown-item');
  
                // Add an image, if available
                const img = document.createElement('img');
                img.src = result.image_url; // Replace with your default image if needed
                img.classList.add('dropdown-item-img');
  
                // Add text
                const span = document.createElement('span');
                span.classList.add('dropdown-item-text');
                span.textContent = result.username; // Adjust key as per your API response
  
                // Append image and text to the list item
                li.appendChild(img);
                li.appendChild(span);
  
                // Append the list item to the dropdown results
                dropdownResults.appendChild(li);
                
                FriendCard(shadowRoot);
              });
            } else {
              // If no results, show a message
              const noResultsItem = document.createElement('li');
              noResultsItem.textContent = 'No results found';
              noResultsItem.classList.add('dropdown-item');
              dropdownResults.appendChild(noResultsItem);
            }
          } else {
            console.error('Failed to fetch search results:', response.status);
          }
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      } 
      else {
        dropdownSearch.style.display = 'none'; // Cacher le dropdown si le champ est vide
      }
    });
  }

  // Gestion du clic en dehors pour cacher le dropdown
  shadowRoot.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target) && !dropdownSearch.contains(e.target)) {
      dropdownSearch.style.display = 'none';
    }
  });
}

export function initializeNotifications(shadowRoot) {
  const notfImage = shadowRoot.querySelector('#NotfImage');
  const dropdownNotf = shadowRoot.querySelector('#dropdownNotf');

  // Toggle the visibility of the notifications dropdown when NotfImage is clicked
  notfImage.addEventListener('click', async (event) => {
    event.stopPropagation();
    await loadNotifications(shadowRoot);

  });

  // Hide the dropdown when clicking outside of it
  shadowRoot.addEventListener('click', (event) => {
    if (!dropdownNotf.contains(event.target) && event.target !== notfImage) {
      dropdownNotf.classList.add('hidden');
    }
  });
}

async function loadNotifications(shadowRoot) {
  const dropdownNotf = shadowRoot.querySelector('#dropdownNotf');

  // Clear existing notifications
  dropdownNotf.innerHTML = '';

  try {
    const token = await getAccessToken();
    const response = await fetch('/friends/notifications/', { // Ensure this URL matches your backend routing
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      const notifications = data; // Since your view returns a list directly

      if (notifications.length === 0) {
        // Display centered message when no notifications are present
        const noNotfMsg = document.createElement('p');
        noNotfMsg.textContent = 'No new notifications.';
        noNotfMsg.classList.add('centered-message-notif');
        dropdownNotf.appendChild(noNotfMsg);
      } else {
        notifications.forEach(notification => {
          // Create a new sub-menu link for each notification
          const notfItem = document.createElement('div');
          notfItem.classList.add('sub-menu-link-notf');

          // Sender's Avatar (Assuming you have a way to get sender's avatar)
          const senderAvatar = document.createElement('img');
          senderAvatar.src = notification.sender_avatar; // Replace with actual sender avatar if available

          notfItem.appendChild(senderAvatar);

          // Notification Text
          const notfText = document.createElement('p');
          notfText.textContent = `${notification.sender} ${notification.action}`;
          notfItem.appendChild(notfText);

          // Optionally, add a timestamp or link to the related action

          dropdownNotf.appendChild(notfItem);
        });
      }
    } else {
      globalNotifPopup('Error', data.error || 'Failed to load notifications');
    }
  } catch (error) {
    globalNotifPopup('Error', error.message);
  }
}

export function initializeCommonScripts(shadowRoot) 
{
  searchBarProcess(shadowRoot);
  initializeNotifications(shadowRoot);
  // Gestion du dropdown des notifications
  const NotfImage = shadowRoot.getElementById('NotfImage');
  const dropdownNotf = shadowRoot.getElementById('dropdownNotf');
  const arrow = shadowRoot.getElementById('arrow');

  if (NotfImage && dropdownNotf) 
  {
    NotfImage.addEventListener('click', () => 
    {
      dropdownNotf.classList.toggle('active');
      arrow.classList.toggle('active');
    });
    shadowRoot.addEventListener('click', (event) => 
    {
      if (!NotfImage.contains(event.target) && !dropdownNotf.contains(event.target)) 
      {
        dropdownNotf.classList.remove('active');
        arrow.classList.remove('active');
      }
    });
  }


  // Gestion du dropdown de profil
  const profileImage = shadowRoot.querySelector('.prfl');
  const dropdown = shadowRoot.getElementById('dropdown');
  if (profileImage && dropdown) {
    profileImage.addEventListener('click', () => 
    {
      dropdown.classList.toggle('active');
    });
    shadowRoot.addEventListener('click', (event) => 
    {
      if (!profileImage.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('active');
      }
    });
  }
}

export function sessionLoggedOut()
{
  globalNotifPopup("Warning", 'Your session has expired. Please log in again.');
  navigateTo("Login");
}

export async function getAccessToken() {
  try {
      const response = await fetch('/auth/get-access-token/', {
          method: 'GET',
          credentials: 'include',
      });

      if (response.status === 204)
          return null; // Return null when no token is found

      if (!response.ok) {
          // throw new Error(`Failed to fetch access token: ${response.status} ${response.statusText}`);
          sessionLoggedOut();
          return;
      }

      const data = await response.json();

      if (data.access_token) {
          return data.access_token;
      } else {
          // console.warn('Access token is not in the response payload.');
          return null; // Return null instead of throwing
      }
  } catch (error) {
      // console.error('Error fetching access token:', error);
      return null; // Return null to avoid breaking the flow
  }
}

export async function getUserInfos(shadowRoot)
{
  const token = await getAccessToken();

  if(!token)
  {
    if(token.status === 401)
      return;
  }

  const response = await fetch('/user/profile/', 
  {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
  },
  });

  const data = await response.json();
  if(localStorage.getItem("authFetchRequired"))
  {
    globalNotifPopup("Success", "Welcome Back " + data.username);
    localStorage.removeItem("authFetchRequired");
  }
  // if (data.is_42_logged_in) {
  //     if (data.message === "2FA is required") {
  //         // handleLoginResponse(data);
  //         alert("OOOOk")
  //       } else {
  //         // fetchAndDisplayUserProfile();
  //         alert("WIIIII")
  //     }
  // }
  // else {
  //     fetchAndDisplayUserProfile();
  // }

  const prfl_image = shadowRoot.querySelectorAll(".prfl");
  const profile_image = shadowRoot.querySelectorAll(".img_profile");
  const username = shadowRoot.querySelectorAll(".usernameProfile");
  const settingsFN = shadowRoot.getElementById("settingsFN");
  const settingsLN = shadowRoot.getElementById("settingsLN");
  const settingsUN = shadowRoot.getElementById("settingsUN");
  const settingsEM = shadowRoot.getElementById("settingsEM");

  if (data.image) 
  {
    profile_image.forEach((imgField) => {
      imgField.src = data.image;
    });

    prfl_image.forEach((imgField) => {
      imgField.src = data.image;
    });
  }

  // Example: Update user name or other data
  if (data.username) {
    username.forEach((usernameField) => {
      usernameField.textContent = data.username;
    });
    if(settingsUN)
      settingsUN.value = data.username;
  }

  if(data.first_name)
  {
    if(settingsFN)
      settingsFN.value = data.first_name;
  }

  if(data.last_name)
  {
    if(settingsLN)
      settingsLN.value = data.last_name;
  }
  if(data.email)
  {
    if(settingsEM)
      settingsEM.value = data.email;
  }
  return data;
}

export function globalNotifPopup(type = "Success", message = "Your changes have been saved") {
  const toast = document.querySelector(".toast");
  const closeIcon = toast.querySelector(".close");
  const progress = toast.querySelector(".progress");
  const notifType = toast.querySelector("#notif-type");
  const notifMessage = toast.querySelector("#notif-message");

  const iconSuccess = toast.querySelector(".icon-circle-success");
  const iconError = toast.querySelector(".icon-circle-error");

  let timer1, timer2;

  // Réinitialisation du texte de la notification
  notifType.textContent = type;
  notifMessage.textContent = message;

  // Cacher les cercles au départ
  iconSuccess.style.display = "none";
  iconError.style.display = "none";

  progress.style.backgroundColor = 'transparent';

  // Afficher le cercle correspondant en fonction du type
  if (type === "Error") {
    iconError.style.display = "flex";  // Afficher cercle rouge pour erreur
    notifType.style.color = "#f44040";  // Afficher cercle rouge pour erreur
    progress.style.backgroundColor = '#f44040';
  }
  else if (type === "Warning") 
  {
    notifType.style.color = "#E49B0F";
    progress.style.backgroundColor = '#E49B0F';
  }
  else {
    iconSuccess.style.display = "flex";  // Afficher cercle vert pour succès
    notifType.style.color = "#4CAF50";
    progress.style.backgroundColor = '#4CAF50';
  }

  // Activer la toast et la barre de progression
  toast.classList.add("active");
  progress.classList.add("active");

  // Timer pour retirer la toast après 5 secondes
  timer1 = setTimeout(() => {
    toast.classList.remove("active");
  }, 5000);

  // Timer pour retirer la barre de progression après 5.3 secondes
  timer2 = setTimeout(() => {
    progress.classList.remove("active");
  }, 5300);

  // Fermeture de la notification au clic sur la croix
  closeIcon.addEventListener("click", () => {
    toast.classList.remove("active");

    setTimeout(() => {
      progress.classList.remove("active");
    }, 300);

    clearTimeout(timer1);
    clearTimeout(timer2);
  });
}

export async function logoutProcess()
{
  const token = await getAccessToken();
  fetch('/auth/logout/', {
      method: 'POST',
      credentials: 'include',  // Include cookies to clear tokens
      headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
      }
  })
  .then(response => {
      if (response.ok) {
        globalNotifPopup("Success", "Good Bye 😉");
        navigateTo("login");
      } else {
        globalNotifPopup("Error", 'Logout failed. Please try again.');
      }
  })
  .catch(error => {
    globalNotifPopup("Error", 'Error during logout:' + error);
  });
}

export async function showFriendCard(user, friendCard, friendshipStatus = { status: 'no_relation', blocked_by_me: false }) {
  const friendImage = friendCard.querySelector('.friend-avatar img');
  const friendName = friendCard.querySelector('.friend-name');
  const actionBtn = friendCard.querySelector('#actionFriend-btn');
  const blockBtn = friendCard.querySelector('#blockFriend-btn');
  const statusMsg = friendCard.querySelector('.status-msg'); // Optional status message element
  const rejectRequestBtn = friendCard.querySelector('#rejectRequest-btn');

  // Reset styles and content
  friendImage.style.width = '';
  friendImage.style.height = '';
  friendImage.style.objectFit = 'cover';
  friendName.textContent = '';

  if (friendshipStatus.status === 'blocked') {
    if (friendshipStatus.blocked_by_me) {
      // Blocker view
      friendImage.src = user.image_url; // Ensure this path points to a 100x100 image
      friendImage.style.width = '100px';
      friendImage.style.height = '100px';
      friendName.textContent = user.username;
    } else {
      // Blocked user view
      friendImage.src = '/default-avatar.png'; // Ensure this path points to a 100x100 image
      friendImage.style.width = '100px';
      friendImage.style.height = '100px';
      friendName.textContent = 'undefined';
    }
  } else {
    // For other statuses, show actual user details
    friendImage.src = user.image_url;
    friendName.textContent = user.username || 'Unknown User';
  }

  // Determine UI based on friendship status
  if (friendshipStatus.status === 'blocked') {
    if (friendshipStatus.blocked_by_me) {
      // Show Unblock button only
      actionBtn.style.display = 'inline-block';
      actionBtn.textContent = 'Unblock User';
      delete actionBtn.dataset.friendshipId;
      rejectRequestBtn.style.display = 'none';
      blockBtn.style.display = 'none';
      if (statusMsg) {
        statusMsg.textContent = 'You have blocked this user.';
        statusMsg.style.display = 'block';
      }
    } else {
      // Blocked user view: hide all buttons and show undefined
      actionBtn.style.display = 'none';
      blockBtn.style.display = 'none';
      rejectRequestBtn.style.display = 'none'; // Hide Reject button
      if (statusMsg) {
        statusMsg.textContent = 'This user has blocked you.';
        statusMsg.style.display = 'block';
      }
    }
  } else {
    switch (friendshipStatus.status) {
      case 'friends':
        actionBtn.style.display = 'inline-block';
        actionBtn.textContent = 'Remove Friend';
        actionBtn.dataset.friendshipId = friendshipStatus.friendship_id;
        blockBtn.style.display = 'inline-block';
        blockBtn.textContent = 'Block Friend';
        rejectRequestBtn.style.display = 'none'; // Hide Reject button
        if (statusMsg) {
          statusMsg.textContent = 'You are friends with this user.';
          statusMsg.style.display = 'block';
        }
        break;

      case 'outgoing_request':
        actionBtn.style.display = 'inline-block';
        actionBtn.textContent = 'Cancel Request';
        actionBtn.dataset.friendshipId = friendshipStatus.friendship_id;
        blockBtn.style.display = 'inline-block';
        rejectRequestBtn.style.display = 'none'; // Hide Reject button
        blockBtn.textContent = 'Block Friend';
        if (statusMsg) {
          statusMsg.textContent = 'Friend request sent.';
          statusMsg.style.display = 'block';
        }
        break;

      case 'incoming_request':
        actionBtn.style.display = 'inline-block';
        actionBtn.textContent = 'Accept Request';
        actionBtn.dataset.friendshipId = friendshipStatus.friendship_id;
        blockBtn.style.display = 'inline-block';
        rejectRequestBtn.style.display = 'inline-block'; // Show Reject button
        rejectRequestBtn.dataset.friendshipId = friendshipStatus.friendship_id;
        blockBtn.textContent = 'Block Friend';
        if (statusMsg) {
          statusMsg.textContent = 'You have a new friend request.';
          statusMsg.style.display = 'block';
        }
        break;

      case 'no_relation':
      default:
        actionBtn.style.display = 'inline-block';
        actionBtn.textContent = 'Add Friend';
        delete actionBtn.dataset.friendshipId;
        blockBtn.style.display = 'inline-block';
        rejectRequestBtn.style.display = 'none';
        blockBtn.textContent = 'Block Friend';
        if (statusMsg) {
          statusMsg.style.display = 'none';
        }
        break;
    }
  }

  // Ensure buttons are enabled
  actionBtn.disabled = false;
  blockBtn.disabled = false;
  rejectRequestBtn.disabled = false;
}

export function hideFriendCard(friendCard) {
  // Attempt to find the overlay within the same root (shadow DOM or document)
  const root = friendCard.getRootNode();
  let overlay = root.querySelector('.overlay');
  
  // Fallback to document if overlay is not found in the root
  if (!overlay) {
    overlay = document.querySelector('.overlay');
  }
  
  // Hide the overlay if it exists
  if (overlay) {
    overlay.style.display = 'none';
  }
  
  // Hide the friend card
  friendCard.style.display = 'none';
}

async function handleAddFriend(friendCard) {
  const actionBtn = friendCard.querySelector('#actionFriend-btn');
  const username = friendCard.querySelector('.friend-name').textContent;

  actionBtn.disabled = true;

  try {
    const token = await getAccessToken();
    const response = await fetch('friends/send-request/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to_username: username }),
    });

    const data = await response.json();

    if (response.ok) {
      globalNotifPopup('Success', data.message || 'Friend request sent successfully');
      showFriendCard(
        { username, image_url: friendCard.querySelector('.friend-avatar img').src },
        friendCard,
        { status: 'outgoing_request', friendship_id: data.friendship_id, blocked_by_me: false }
      );
    } else {
      globalNotifPopup('Error', data.error || 'Failed to send friend request');
    }
  } catch (error) {
    globalNotifPopup('Error', error.message);
  }

  actionBtn.disabled = false;
}

async function handleCancelFriendRequest(friendCard) {
  const actionBtn = friendCard.querySelector('#actionFriend-btn');
  const friendshipId = actionBtn.dataset.friendshipId;
  const username = friendCard.querySelector('.friend-name').textContent;

  actionBtn.disabled = true;

  try {
    const token = await getAccessToken();
    const response = await fetch(`friends/cancel-outgoing-request/${friendshipId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      globalNotifPopup('Success', data.message || 'Friend request cancelled successfully');
      showFriendCard(
        { username, image_url: friendCard.querySelector('.friend-avatar img').src },
        friendCard,
        { status: 'no_relation', blocked_by_me: false }
      );
    } else {
      globalNotifPopup('Error', data.error || 'Failed to cancel friend request');
    }
  } catch (error) {
    globalNotifPopup('Error', error.message);
  }

  actionBtn.disabled = false;
}

async function handleAcceptRequest(friendCard) {
  const actionBtn = friendCard.querySelector('#actionFriend-btn');
  const friendshipId = actionBtn.dataset.friendshipId;
  const username = friendCard.querySelector('.friend-name').textContent;

  actionBtn.disabled = true;

  try {
    const token = await getAccessToken();
    const response = await fetch(`friends/accept-request/${friendshipId}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      globalNotifPopup('Success', data.message || 'Friend request accepted successfully');
      showFriendCard(
        { username, image_url: friendCard.querySelector('.friend-avatar img').src },
        friendCard,
        { status: 'friends', friendship_id: friendshipId, blocked_by_me: false }
      );
    } else {
      globalNotifPopup('Error', data.error || 'Failed to accept friend request');
    }
  } catch (error) {
    globalNotifPopup('Error', error.message);
  }

  actionBtn.disabled = false;
}

async function handleRejectRequest(friendCard) {
  const actionBtn = friendCard.querySelector('#actionFriend-btn');
  const friendshipId = actionBtn.dataset.friendshipId;
  const username = friendCard.querySelector('.friend-name').textContent;

  actionBtn.disabled = true;

  try {
    const token = await getAccessToken();
    const response = await fetch(`friends/reject-request/${friendshipId}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      globalNotifPopup('Success', data.message || 'Friend request rejected successfully');
      showFriendCard(
        { username, image_url: friendCard.querySelector('.friend-avatar img').src },
        friendCard,
        { status: 'no_relation', blocked_by_me: false }
      );
    } else {
      globalNotifPopup('Error', data.error || 'Failed to reject friend request');
    }
  } catch (error) {
    globalNotifPopup('Error', error.message);
  }

  actionBtn.disabled = false;
}

async function handleRemoveFriend(friendCard) {
  const actionBtn = friendCard.querySelector('#actionFriend-btn');
  const username = friendCard.querySelector('.friend-name').textContent;

  const confirmRemove = confirm(`Are you sure you want to remove ${username} as a friend?`);
  if (!confirmRemove) return;

  actionBtn.disabled = true;

  try {
    const token = await getAccessToken();
    const response = await fetch(`friends/remove/${username}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      globalNotifPopup('Success', data.message || 'Friend removed successfully');
      showFriendCard(
        { username, image_url: friendCard.querySelector('.friend-avatar img').src },
        friendCard,
        { status: 'no_relation', blocked_by_me: false }
      );
    } else {
      globalNotifPopup('Error', data.error || 'Failed to remove friend');
    }
  } catch (error) {
    globalNotifPopup('Error', error.message);
  }

  actionBtn.disabled = false;
}

async function handleBlockFriend(friendCard) {
  const blockBtn = friendCard.querySelector('#blockFriend-btn');
  const username = friendCard.querySelector('.friend-name').textContent;

  const confirmBlock = confirm(`Are you sure you want to block ${username}? This will remove any existing friendship.`);
  if (!confirmBlock) return;

  blockBtn.disabled = true;

  try {
    const token = await getAccessToken();
    const response = await fetch(`friends/${username}/block/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      globalNotifPopup('Success', data.message || 'User blocked successfully');
      showFriendCard(
        { username, image_url: friendCard.querySelector('.friend-avatar img').src },
        friendCard,
        { status: 'blocked', blocked_by_me: true }
      );
    } else {
      globalNotifPopup('Error', data.error || 'Failed to block user');
    }
  } catch (error) {
    globalNotifPopup('Error', error.message);
  }

  blockBtn.disabled = false;
}

async function handleUnblockUser(friendCard) {
  const actionBtn = friendCard.querySelector('#actionFriend-btn');
  const username = friendCard.querySelector('.friend-name').textContent;

  const confirmUnblock = confirm(`Are you sure you want to unblock ${username}?`);
  if (!confirmUnblock) return;

  actionBtn.disabled = true;

  try {
    const token = await getAccessToken();
    const response = await fetch(`friends/${username}/unblock/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      globalNotifPopup('Success', data.message || 'User unblocked successfully');
      const friendshipStatus = await getFriendshipStatus(username);
      showFriendCard(
        { username, image_url: friendCard.querySelector('.friend-avatar img').src },
        friendCard,
        friendshipStatus
      );
    } else {
      globalNotifPopup('Error', data.error || 'Failed to unblock user');
    }
  } catch (error) {
    globalNotifPopup('Error', error.message);
  }

  actionBtn.disabled = false;
}

async function getFriendshipStatus(username) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`friends/status/${username}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      globalNotifPopup('Error', data.error || 'Failed to fetch friendship status');
      return { status: 'no_relation', blocked_by_me: false };
    }

    return {
      status: data.status,
      blocked_by_me: data.blocked_by_me || false,
      friendship_id: data.friendship_id,
    };
  } catch (error) {
    globalNotifPopup('Error', error.message);
    return { status: 'no_relation', blocked_by_me: false };
  }
}

export function FriendCard(shadowRoot) {
  const overlay = shadowRoot.querySelector('.overlay');
  const closeBtn = shadowRoot.querySelector('.close-btn');
  const actionBtn = shadowRoot.querySelector('#actionFriend-btn');
  const blockBtn = shadowRoot.querySelector('#blockFriend-btn');
  const rejectRequestBtn = shadowRoot.querySelector('#rejectRequest-btn');

  // Attach event listener to the "Action Friend" button if not already attached
  if (!actionBtn.dataset.listenerAttached) {
    actionBtn.addEventListener('click', async () => {
      const action = actionBtn.textContent;

      if (action === 'Add Friend') {
        await handleAddFriend(shadowRoot.querySelector('.friend-card'));
      } else if (action === 'Cancel Request') {
        await handleCancelFriendRequest(shadowRoot.querySelector('.friend-card'));
      } else if (action === 'Accept Request') {
        await handleAcceptRequest(shadowRoot.querySelector('.friend-card'));
      } else if (action === 'Reject Friend') {
        await handleRejectRequest(shadowRoot.querySelector('.friend-card'));
      } else if (action === 'Remove Friend') {
        await handleRemoveFriend(shadowRoot.querySelector('.friend-card'));
      } else if (action === 'Unblock User') {
        await handleUnblockUser(shadowRoot.querySelector('.friend-card'));
      }
    });
    actionBtn.dataset.listenerAttached = 'true';
  }

  if (!rejectRequestBtn.dataset.listenerAttached) {
    rejectRequestBtn.addEventListener('click', async () => {
      const action = rejectRequestBtn.textContent;
      const friendCard = shadowRoot.querySelector('.friend-card');

      if (action === 'Reject Request') {
        await handleRejectRequest(friendCard);
      }
    });
    rejectRequestBtn.dataset.listenerAttached = 'true';
  }

  // Attach event listener to the "Block Friend" button if not already attached
  if (!blockBtn.dataset.listenerAttached) {
    blockBtn.addEventListener('click', async () => {
      const action = blockBtn.textContent;

      if (action === 'Block Friend') {
        await handleBlockFriend(shadowRoot.querySelector('.friend-card'));
      }
    });
    blockBtn.dataset.listenerAttached = 'true';
  }

  // Attach event listener to the "Close" button if not already attached
  if (!closeBtn.dataset.listenerAttached) {
    closeBtn.addEventListener('click', () => hideFriendCard(shadowRoot.querySelector('.friend-card')));
    closeBtn.dataset.listenerAttached = 'true';
  }

  // Attach event listener to the overlay if not already attached
  if (!overlay.dataset.listenerAttached) {
    overlay.addEventListener('click', () => hideFriendCard(shadowRoot.querySelector('.friend-card')));
    overlay.dataset.listenerAttached = 'true';
  }

  // Attach event listeners to dropdown items
  shadowRoot.querySelectorAll('.dropdown-item').forEach((item) => {
    if (!item.dataset.listenerAttached) {
      item.addEventListener('click', async () => {
        const user = {
          username: item.querySelector('.dropdown-item-text').textContent,
          image_url: item.querySelector('.dropdown-item-img').src,
        };

        const friendshipStatus = await getFriendshipStatus(user.username);
        showFriendCard(user, shadowRoot.querySelector('.friend-card'), friendshipStatus);
        shadowRoot.querySelector('.friend-card').style.display = 'block';
        shadowRoot.querySelector('.overlay').style.display = 'block';
      });
      item.dataset.listenerAttached = 'true';
    }
  });
}
