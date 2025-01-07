// import { getAccessToken } from "./shared.js";

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
};
  
function navigateTo(page) 
{
  // console.log("Navigating to:", page);
  const app = document.getElementById("app");
  const loader = document.getElementById("loader");

  loader.style.display = "flex";

  if (routes[page])
  {
    app.innerHTML = "";

    history.pushState({ page }, "", `/${page}`);
    app.innerHTML = `<${routes[page]}></${routes[page]}>`;

    document.body.className = `body-${page}`;

    const randomDelay = Math.floor(Math.random() * (900 - 100 + 1)) + 100;

    setTimeout(() => 
    {
      loader.style.display = "none";
    }, randomDelay);
  } 
  else 
    navigateTo("login");
}


window.addEventListener("popstate", (e) => 
{
    const state = e.state;
    if (state && state.page) 
    {
      navigateTo(state.page);
    }
});

document.addEventListener("DOMContentLoaded", () => 
{
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


let sendNotif = document.querySelector('#sendNotif')
const notificationPopup = document.querySelector('.toast');
let acceptBtn;
let rejectBtn;
let timer;
// console.log("heeeey : ",notificationPopup);


function notifications() {
//alert('ahh');
let notif_socket;
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
acceptBtn.addEventListener('click', () => {
    let jsonMessage = {'type': 'game_resp', 'receiver_id': '2'}
    notif_socket.send(JSON.stringify(jsonMessage));
    // logic game matching 
    // alert('game_resp');
})
getAccessToken()
.then(accessToken => {
  notif_socket = new WebSocket(`/ws/notification/?Token=${accessToken}`);
  notif_socket.onmessage = ({data}) => {
      const datap = JSON.parse(data);
      console.log('Message Received is ', datap.type);
      // if game response is received
      // game matching logic
      if (datap.type === 'game_resp') {
          alert('game_resp');
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
      sendNotif.addEventListener('click', () => {
          let jsonMessage = {'type': 'game_request_notification', 'receiver_id': '1'}
          notif_socket.send(JSON.stringify(jsonMessage));
          console.log('Notification sent');
      })
  }
})
.catch(error => console.error('Error fetching notifications:', error));
}

notifications();

