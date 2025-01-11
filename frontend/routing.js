
// const routes = 
// {
//     login: "login-page",
//     signup: "signup-page",
//     resetpassword: "resetpassword-page",
//     newpassword: "newpassword-page",
//     dashboard: "dashboard-page",
//     authentification: "authentification-page",
//     chat: "chat-page",
//     game: "game-page" ,
//     settings: "settings-page",
//     pingpong : "pingpong-page",
// };



// let notif_socket = null;
// let sendNotif = null
// const notificationPopup = document.querySelector('.toast');
// let acceptBtn;
// let rejectBtn;
// let timer;
// // const pageInstances = new Map();
// // function save_me (element) {
// //     if (element) {
// //         pageInstances.set(element.tagName.toLowerCase(), element);
// //         console.log("pageINSTANCE in SAVER : ",pageInstances)
// //     }
// // }
// function navigateTo(page) 
// {
//   const app = document.getElementById("app");
//   const loader = document.getElementById("loader");

//   loader.style.display = "flex";

//   if (routes[page])
//   {
//     app.innerHTML = "";

//     history.pushState({ page }, "", `/${page}`);
//     app.innerHTML = `<${routes[page]}></${routes[page]}>`;

//     document.body.className = `body-${page}`;
    
//     const randomDelay = Math.floor(Math.random() * (900 - 100 + 1)) + 100;
    
//     setTimeout(() => 
//         {
//             loader.style.display = "none";
//         }, randomDelay);
//     if (page === "chat") {
//         const chatPage = document.querySelector('chat-page');
//         if (chatPage) {
//             sendNotif = chatPage.getTicBtn(); // Access element from shadowRoot
//             if (sendNotif) {
//                 sendNotif.addEventListener('click', () => {
//                     let jsonMessage = {'type': 'game_request_notification', 'receiver_username': chatPage.getOtherUser(), 'sender_id': chatPage.getCurrentUser()}
//                     console.log('Sending notification:', jsonMessage);
//                     console.log('Notification sent');
//                     notif_socket.send(JSON.stringify(jsonMessage));
//                 })
//             }
//             console.log("SEND NOTIF: ", sendNotif);
//         } else {
//             console.error("ChatPage element not found!");
//         }
//     }
//   } 
//   else 
//     navigateTo("login");
// }


// window.addEventListener("popstate", (e) => 
// {
//     const state = e.state;
//     if (state && state.page) 
//     {
//       navigateTo(state.page);
//     }
// });

// document.addEventListener("DOMContentLoaded", () => 
// {
//     const path = window.location.pathname.slice(1);
//     const page = path || "login";
//     navigateTo(page);
// });

function globalNotifPopup(type = "Success", message = "Your changes have been saved") {
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

const routes = 
{
    login: "login-page",
    signup: "signup-page",
    resetpassword: "resetpassword-page",
    newpassword: "newpassword-page",
    dashboard: "dashboard-page",
    authentification: "authentification-page",
    chat: "chat-page",
    game: "game-page" ,
    settings: "settings-page",
    pingpong: "pingpong-page",
};

// Define which routes are protected
const protectedRoutes = new Set([
    "chat",
    "game",
    "settings",
    "pingpong",
    "dashboard"
]);

let notif_socket = null;
let sendNotif = null;
const notificationPopup = document.querySelector('.toast');
let acceptBtn;
let rejectBtn;
let timer;

/**
 * Fetches the access token from the backend.
 * Returns true if an access token exists (user is authenticated), or false otherwise.
 */
async function checkAuthentication() {
    try {
        const response = await fetch('/auth/get-access-token/', { credentials: 'include' });
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        if (data.access_token) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        globalNotifPopup("Error", "Error during authentication check:", error);
        return false;
    }
}

/**
 * Modified navigateTo function that checks authentication for protected routes.
 */
async function navigateTo(page) {
    const app = document.getElementById("app");
    const loader = document.getElementById("loader");

    loader.style.display = "flex";

    // If the page is protected, ensure the user is authenticated
    if (protectedRoutes.has(page)) {
        const isAuth = await checkAuthentication();
        if (!isAuth) {
            globalNotifPopup("Warning", `Login to access ${page}. Redirecting to login.`);
            return navigateTo("login");
        }
    }

    if (routes[page]) {
        app.innerHTML = "";
        history.pushState({ page }, "", `/${page}`);
        app.innerHTML = `<${routes[page]}></${routes[page]}>`;
        document.body.className = `body-${page}`;
    
        const randomDelay = Math.floor(Math.random() * (900 - 100 + 1)) + 100;
        setTimeout(() => {
            loader.style.display = "none";
        }, randomDelay);
    
        if (page === "chat") {
            const chatPage = document.querySelector('chat-page');
            if (chatPage) {
                sendNotif = chatPage.getTicBtn(); // Access element (e.g., from shadow DOM)
                if (sendNotif) {
                    sendNotif.addEventListener('click', () => {
                        let jsonMessage = {
                            'type': 'game_request_notification',
                            'receiver_username': chatPage.getOtherUser(),
                            'sender_id': chatPage.getCurrentUser()
                        };
                        console.log('Sending notification:', jsonMessage);
                        console.log('Notification sent');
                        notif_socket.send(JSON.stringify(jsonMessage));
                    });
                }
                console.log("SEND NOTIF: ", sendNotif);
            } else {
                console.error("ChatPage element not found!");
            }
        }
    } else {
        // Unknown route: redirect to login
        navigateTo("login");
    }
}

// Browser navigation using the back/forward buttons
window.addEventListener("popstate", (e) => {
    const state = e.state;
    if (state && state.page) {
        navigateTo(state.page);
    }
});

// On initial page load, determine the route from the URL path.
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname.slice(1);
    const page = path || "login";
    navigateTo(page);
});


  
/*   NOTIFICATIONS */
function getAccessToken() {
  return fetch('/auth/get-access-token/', {
      method: 'GET',
      credentials: 'include'  // Include cookies in the request
  })
  .then(response => response.json())
  .then(data => {
      if (data.access_token) {
          return data.access_token;
      } else {
          throw new Error('Access token not found');
      }
  })
  .catch(error => {
      console.error('Error fetching access token:', error);
      throw error;
  });
}


let datap = null
function notifications() {
acceptBtn = document.createElement('button');
rejectBtn = document.createElement('button');
rejectBtn.classList.add('rejectBtn');
acceptBtn.classList.add('acceptBtn');
rejectBtn.textContent = 'Reject';
acceptBtn.textContent = 'Accept';

rejectBtn.addEventListener('click', () => {
    clearTimeout(timer);
    notificationPopup.classList.remove('active');
    timer = setTimeout(() => {
        notificationPopup.classList.remove('invtPopup');
    }, 500);
})

async function callme(friendId, obj){
    await obj.friendsGame(friendId)
}

acceptBtn.addEventListener('click', () => {
    console.log("...........................: ",datap);
    let jsonMessage = {'type': 'game_resp', 'receiver_id': datap.sender, 'sender_id': datap.receiver};
    notif_socket.send(JSON.stringify(jsonMessage));
    clearTimeout(timer);
    notificationPopup.classList.remove('active');

    /** TESTINNNG */
    const app = document.getElementById("app");
    const loader = document.getElementById("loader");

    loader.style.display = "flex";
    app.innerHTML = "";

    history.pushState({ page: 'game' }, "", `/game`);
    app.innerHTML = `<game-page></game-page>`;
    document.body.className = `body-game`;
    const randomDelay = Math.floor(Math.random() * (900 - 100 + 1)) + 100;
    setTimeout(() => {
        loader.style.display = "none";
    }, randomDelay);

    const game_page = document.querySelector('game-page');
    // async  () => {
    //     await game_page.friendsGame()
    // }
    callme(datap.sender,game_page)
    // logic game matching 
    // alert('game_resp');

    /** END TESTING  */
})

getAccessToken()
.then(accessToken => {
  notif_socket = new WebSocket(`/ws/notification/?Token=${accessToken}`);
  notif_socket.onmessage = ({data}) => {
      datap = JSON.parse(data);
      console.log('Message Received is --------------------', datap);
    //   console.log('Message receiverd_id :  ', datap.receiver_id);
    //   console.log('Message sender_id :  ', datap.sender_id);
      // if game response is received
      // game matching logic
      if (datap.type === 'game_resp') {
          console.log("HE ACCEPTEEEEEEEEEEEEED : ", datap);
          // render 
           /** TESTINNNG */
            // setTimeout(() => {
                const app = document.getElementById("app");
            const loader = document.getElementById("loader");

            loader.style.display = "flex";
            app.innerHTML = "";

            history.pushState({ page: 'game' }, "", `/game`);
            app.innerHTML = `<game-page></game-page>`;
            document.body.className = `body-game`;
            const randomDelay = Math.floor(Math.random() * (900 - 100 + 1)) + 100;
            setTimeout(() => {
                loader.style.display = "none";
            }, randomDelay);

            const game_page = document.querySelector('game-page');
            // game_page.friendsGame()
        // },1000)
        // async  () => {
        //     await game_page.friendsGame()
        // }
        // setTimeout(() => {
        callme(datap.sender ,game_page)
        // },1000)
            // logic game matching 
            // alert('game_resp');

            /** END TESTING  */
      }
      else {

          notificationPopup.textContent = "flane is inviting you to play a game";
          let btns = document.createElement('div');
          btns.appendChild(acceptBtn);
          btns.appendChild(rejectBtn);
          notificationPopup.appendChild(btns);
          notificationPopup.classList.add('active', 'invtPopup');
          timer = setTimeout(() => {
              notificationPopup.classList.remove('active');
              setTimeout(() => {
                  notificationPopup.classList.remove('invtPopup');
              }, 500);
          }, 5000); // Hide after 3 seconds
      }
  }
  notif_socket.onopen = () => {
      console.log("Heeeeeeeeeeeeeeeeeeeere : socket oppened");
  }
})
.catch(error => console.error('Error fetching notifications:', error));
}

notifications();

