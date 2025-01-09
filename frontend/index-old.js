const appState = {
  username: "",
  profileImage: "",
};

function renderPage(page) 
{
  const app = document.getElementById("app");
  const loader = document.getElementById("loader");
  const template = document.getElementById(`${page}-template`);

  if (template) 
    {
    loader.style.display = "block";

    const existingLink = document.getElementById("page-css");
    if (existingLink) 
      {
      existingLink.remove();
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.id = "page-css";
    link.href = `styles/${page}.css?ts=${new Date().getTime()}`;

    link.onload = () =>
    {
      app.innerHTML = "";
      const clone = template.content.cloneNode(true);
      app.appendChild(clone);

      updateCommonElements();

      if (page === "dashboard") 
      {
        dashboardProcess();
      }

      initializePageScripts(page);
      updateActiveNav(page);
      loader.style.display = "none";
    };

    document.head.appendChild(link);
  } else {
    console.error(`Page "${page}" non trouvée.`);
    navigateTo("login");
  }
}

function updateActiveNav(page) 
{
  const navElements = document.querySelectorAll(".nav-element");
  navElements.forEach((navElement) => 
    {
    const img = navElement.querySelector("img");
    const navigateTo = img?.dataset.navigate;

    if (!navigateTo) 
      {
      console.warn("Attribut data-navigate manquant pour un élément.");
      return; // Passe à l'élément suivant
    }

    if (navigateTo === page) 
      {
      navElement.classList.add("active");
      console.log(`Ajout de la classe active à : ${navigateTo}`);
    } 
    else 
    {
      navElement.classList.remove("active");
    }
  });
}

function navigateTo(page) {
  renderPage(page);
  history.pushState({ page }, "", `/${page}`);
}

function initializePageScripts(page) 
{
  initializeCommonScripts();
  switch (page) {

    case 'dashboard':
      dashboardProcess();
      break;

    case "settings":
      initializeTwoFactorSection();
      break;
    case "notfound":
      initializeNotFoundPage();
      break;
    case "login":
      loginProcess();
      break;

    case "signup":
      signupProcess();
      break;
    case "reset-password":
      resetPassword();
      break;
  }
}

// Gestion des fonctionnalités réutilisables
function initializeCommonScripts() {
  // Gestion de la boîte de recherche
  const searchBox = document.querySelector(".input-search");
  const searchButton = document.querySelector(".button-search");
  if (searchBox && searchButton) {
    searchButton.addEventListener("click", () => {
      searchBox.classList.add("active"); // Agrandir
      searchBox.focus();
    });
    searchBox.addEventListener("blur", () => {
      searchBox.classList.remove("active"); // Réduire
      searchBox.value = ""; // Effacer
    });
  }

  // Gestion du dropdown des notifications
  const NotfImage = document.getElementById("NotfImage");
  const dropdownNotf = document.getElementById("dropdownNotf");
  if (NotfImage && dropdownNotf) {
    NotfImage.addEventListener("click", () => {
      dropdownNotf.classList.toggle("active");
    });
    document.addEventListener("click", (event) => {
      if (
        !NotfImage.contains(event.target) &&
        !dropdownNotf.contains(event.target)
      ) {
        dropdownNotf.classList.remove("active");
      }
    });
  }

  // Gestion du dropdown de profil
  const profileImage = document.getElementById("profileImage");
  const dropdown = document.getElementById("dropdown");
  if (profileImage && dropdown) {
    profileImage.addEventListener("click", () => {
      dropdown.classList.toggle("active");
    });
    document.addEventListener("click", (event) => {
      if (
        !profileImage.contains(event.target) &&
        !dropdown.contains(event.target)
      ) {
        dropdown.classList.remove("active");
      }
    });
  }
}

function initializeNotFoundPage() {
  let container = document.getElementById("container-notfound");
  window.onmousemove = function (e) {
    let x = e.clientX / 5;
    y = e.clientY / 5;
    container.style.backgroundPositionX = x + "px";
    container.style.backgroundPositionY = y + "px";
  };
}

function initializeTwoFactorSection() {
  const toggleSwitch = document.getElementById("toggleSwitch");
  const settingsContainer = document.getElementById("settingsContainer");
  const extraContent = document.getElementById("extraContent");

  if (toggleSwitch) {
    toggleSwitch.addEventListener("change", () => {
      if (toggleSwitch.checked) {
        // Activer le défilement et afficher la section supplémentaire
        settingsContainer.classList.add("scrollable");
        extraContent.classList.add("visible");
        // Défilement automatique vers la section
        extraContent.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Désactiver le défilement et masquer la section supplémentaire
        settingsContainer.classList.remove("scrollable");
        extraContent.classList.remove("visible");
      }
    });
  }
}

function handleLoginResponse(data) {
  if (data.error) {
    const errorDiv = document.getElementById("error-message");
    errorDiv.textContent = data.error;

  } else if (data.temporary_token) {
    navigateTo("authentication");
    window.temporaryToken = data.temporary_token;

  } else {
    // localStorage.removeItem('alertShown');
    appState.username = data.username;
    appState.profileImage = data.image;
    navigateTo("dashboard", data);
  }
}

function updateCommonElements() {
  // Update profile image
  const profileImage = document.getElementById("profileImage");
  const imgProfile = document.getElementById("img_profile");
  const settingsImage = document.getElementById("settingsImage");

  if (profileImage) {
    profileImage.src = appState.profileImage;
    imgProfile.src = appState.profileImage;
    if (settingsImage) settingsImage.src = appState.profileImage;
  }

  // Update username
  const usernameProfile = document.getElementById("usernameProfile");
  if (usernameProfile) {
    usernameProfile.textContent = appState.username;
  }
}

async function dashboardProcess() {

  const response = await fetch('/auth/callback/', {
    method: 'GET',
    credentials: 'include',  // Ensure cookies are sent with the request
  });

  if (!response.ok) {
      // throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      return;
  }

  const data = await response.json();

  if (data.is_42_logged_in) {
      if (data.message === "2FA is required") {
          // handleLoginResponse(data);
          alert("OOOOk")
        } else {
          // fetchAndDisplayUserProfile();
          alert("WIIIII")
      }
  }
  // else {
  //     fetchAndDisplayUserProfile();
  // }

  // Example: Update an image's `src`
  const profileImage = document.getElementById("profileImage");
  if (profileImage && data.image) {
    profileImage.src = data.image;
  }

  // Example: Update user name or other data
  const userName = document.getElementById("username");
  if (userName && data.username) {
    userName.textContent = `Welcome, ${data.username}`;
  }
}

function loginProcess() {
  const loginForm = document.getElementById("loginForm");
  const login42Btn = document.getElementById("login42Btn");

  if (loginForm) {
    document.getElementById("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

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
            handleLoginResponse(data);
          }
        })
        .catch((error) => {
          const errorDiv = document.getElementById("error-message");
          errorDiv.textContent = error.message;
          errorDiv.style.display = "block";
          console.error("Login Error:", error);
        });
    });
  }
  if (login42Btn) {
    login42Btn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.setItem('authFetchRequired', 'true');
      window.location.href = '/auth/login/42-intra';
    });
  }
}

function signupProcess() {
  async function submitRegistration(formData) {
    try {
      const response = await fetch("/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const errorDiv = document.getElementById("error-message");
      errorDiv.textContent = ""; // Clear content

      if (!response.ok) {
        const errors = await response.json();
        for (const [field, messages] of Object.entries(errors)) {
          errorDiv.textContent = messages[0]; // Show only the first general error
          errorDiv.style.display = "block";
        }
      } else {
        const data = await response.json();
        let countdown = 3;
        errorDiv.textContent = `${data.message} in ${countdown}...`;
        errorDiv.style.color = "green";
        errorDiv.style.display = "block";

        const interval = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            errorDiv.textContent = `${data.message} in ${countdown}...`;
          } else {
            clearInterval(interval); // Stop the interval when countdown reaches 0
            errorDiv.style.color = "red";
            errorDiv.style.display = "none";
            navigateTo("login");
            // registerForm.style.display = 'none';
            // loginForm.style.display = 'block';
            // // document.getElementById('password-forgotten').style.display = 'block';
          }
        }, 1000); // Update every 1000 milliseconds (1 second)
      }
    } catch (err) {
      console.error("An error occurred:", err);
    }
  }

  document.getElementById("registerForm").addEventListener("submit", async function (event) {
      event.preventDefault();

      const formData = {
        username: document.getElementById("registerUsername").value,
        first_name: document.getElementById("firstname").value,
        last_name: document.getElementById("lastname").value,
        username: document.getElementById("registerUsername").value,
        email: document.getElementById("email").value,
        password: document.getElementById("registerPassword").value,
        confirm_password: document.getElementById("registerConfirm_password")
          .value,
      };

      submitRegistration(formData);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname;
  if (path != "/") {
    console.log("path : " + path.slice(1));
    navigateTo(path.slice(1));
  } else navigateTo("login");

  window.addEventListener("popstate", (e) => {
    const state = e.state;
    if (state && state.page) {
      renderPage(state.page);
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target;

    if (target.dataset.navigate) {
      e.preventDefault();
      const page = target.dataset.navigate;
      navigateTo(page);
    }
  });

});

function loadTemplate(url, callback) {
  // const appContainer = document.getElementById('app-container'); // Main SPA container

  fetch(url, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load template");
      }
      return response.text(); // Get the HTML content
    })
    .then((html) => {
      // appContainer.innerHTML = html;
      // document.getElementById("loginForm").style.display = 'none';
      if (callback) callback();
    })
    .catch((error) => console.error("Error loading template:", error));
}

function getCookie(name) {
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

async function fetchCsrfToken() {
  return fetch('/user/get-csrf-token/', {
    method: 'GET',
    credentials: 'include', // Include cookies in the request
  })
    .then(response => response.json())
    .then(data => {
      // Set the CSRF token as an HTTP-only cookie
      document.cookie = `csrftoken=${data.csrfToken}; path=/`;
      return data.csrfToken;
    })
    .catch(error => {
      console.error('Error fetching CSRF token:', error);
      throw new Error('Unable to fetch CSRF token');
    });
}

function resetPassword() {
  const form = document.getElementById("passwordResetForm");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("passwordResetEmail").value;
      if (!email) {
        alert("Please enter a valid email address.");
        return;
      }
      let csrfToken = getCookie("csrftoken");
      if (!csrfToken) {
        // Fetch and set CSRF token if not already present
        csrfToken = await fetchCsrfToken();
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
            navigateTo("login");
          } 
          else {
            alert("Failed to send reset link.");
          }
        })
        .catch((error) => console.error("Error:", error));
    });
  }
}

// Load password reset confirmation form
function loadPasswordResetConfirm(uidb64, token) {
  loadTemplate(`/user/reset/${uidb64}/${token}/`, () => {
    const form = document.getElementById("passwordResetConfirmForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const newPassword = document.getElementById("newPassword").value;
        const csrfToken = getCookie("csrftoken");

        const formData = new URLSearchParams();
        formData.append("new_password1", newPassword);
        formData.append("new_password2", newPassword);
        formData.append("csrfmiddlewaretoken", csrfToken);

        fetch(`/user/reset/${uidb64}/${token}/`, {
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
              loadTemplate("/user/reset/done/");
            } else {
              alert("Failed to reset password.");
            }
          })
          .catch((error) => console.error("Error:", error));
      });
    }
  });
}

