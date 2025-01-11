// import { getAccessToken } from "./shared.js";
console.log("--------------------------------------------------")
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
    pingpong : "pingpong-page",
};


let notif_socket = null;
let sendNotif = null
const notificationPopup = document.querySelector('.toast');
let acceptBtn;
let rejectBtn;
let timer;
// const pageInstances = new Map();
// function save_me (element) {
//     if (element) {
//         pageInstances.set(element.tagName.toLowerCase(), element);
//         console.log("pageINSTANCE in SAVER : ",pageInstances)
//     }
// }
function navigateTo(page) 
{
  const app = document.getElementById("app");
  const loader = document.getElementById("loader");

  loader.style.display = "flex";

  if (routes[page])
  {
    // console.log("first child dyal APP : ", app.firstChild);
    // console.log("current page ", page);
    // save_me(app.firstChild);
    // app.innerHTML = "";

    // history.pushState({ page }, "", `/${page}`);
    // document.body.className = `body-${page}`;

    // Check if an instance already exists
    // let pageElement = pageInstances.get(page + '-page');
    // console.log("pageElement :::: ", pageElement);
    // if (!pageElement) 
    // {
        // Create a new instance and store it
        // pageElement = document.createElement(routes[page]);
        // app.innerHTML = `<${routes[page]}></${routes[page]}>`;
        // pageInstances.set(page, app.innerHTML);
        
        // console.log("ma l9aaaaaahch", page);
    // }
    // else{
    //     console.log("hna l9aaaaaah o appendaaaah")
    //     // app.innerHTML = pageElement;
    //     app.appendChild(pageElement);
    // }

    // Append the element to the app
    app.innerHTML = "";

    history.pushState({ page }, "", `/${page}`);
    app.innerHTML = `<${routes[page]}></${routes[page]}>`;
    // console.log("LOOOOOOOOOOOOOOOOOOOOOG page : ",page)
    // console.log("LOOOOOOOOOOOOOOOOOOOOOG : ",app)
    
    document.body.className = `body-${page}`;
    
    const randomDelay = Math.floor(Math.random() * (900 - 100 + 1)) + 100;
    
    setTimeout(() => 
        {
            loader.style.display = "none";
        }, randomDelay);
    if (page === "chat") {
        const chatPage = document.querySelector('chat-page');
        if (chatPage) {
            sendNotif = chatPage.getTicBtn(); // Access element from shadowRoot
            if (sendNotif) {
                sendNotif.addEventListener('click', () => {
                    let jsonMessage = {'type': 'game_request_notification', 'receiver_username': chatPage.getOtherUser(), 'sender_id': chatPage.getCurrentUser()}
                    console.log('Sending notification:', jsonMessage);
                    console.log('Notification sent');
                    notif_socket.send(JSON.stringify(jsonMessage));
                })
            }
            console.log("SEND NOTIF: ", sendNotif);
        } else {
            console.error("ChatPage element not found!");
        }
    }
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




// let sendNotif = document.querySelector('#sendNotif')
// let sendNotif = document.querySelector('#chat-template .modal-tic-button') 

// console.log("heeeey : ",notificationPopup);

let datap = null
function notifications() {
//alert('ahh');
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

