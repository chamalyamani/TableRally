export function updateActiveNav(page, shadowRoot) 
{
  const navElements = shadowRoot.querySelectorAll('.nav-element');

  navElements.forEach(navElement => 
    {
    const img = navElement.querySelector('img');
    const navigateTo = img ? img.dataset.navigate : navElement.dataset.navigate;


    if (!navigateTo) {

      console.warn("Attribut data-navigate manquant pour un élément.");
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

export function initializeCommonScripts(shadowRoot) 
{
  // Gestion de la boîte de recherche
  const searchBox = shadowRoot.querySelector('.input-search');
  const searchButton = shadowRoot.querySelector('.button-search');
  if (searchBox && searchButton) 
  {
    searchButton.addEventListener('click', () => 
    {
      searchBox.classList.add('active'); // Agrandir
      searchBox.focus();
    });
    searchBox.addEventListener('blur', () => 
    {
      searchBox.classList.remove('active'); // Réduire
      searchBox.value = ''; // Effacer
    });
  }

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