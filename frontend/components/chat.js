import { updateActiveNav } from "../shared.js";
import { initializeCommonScripts } from "../shared.js";
import { getUserInfos } from "../shared.js";
import { logoutProcess } from "../shared.js";
// import "../../Chat/frontend/learn.js";

class ChatPage extends HTMLElement 
{
    constructor() 
    {
      super();
      const shadow = this.attachShadow({ mode: "open" });
  

      const template = document.getElementById("chat-template");
      const content = template.content.cloneNode(true);
      shadow.appendChild(content);
  
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "styles/chat.css";
  
      this.style.display = "none";
  
      link.onload = () => 
      {
        this.style.display = "block";
      };
  
      shadow.appendChild(link);

      this.plusIcon = this.shadowRoot.querySelector('.add-message img');
      this.sendButton = this.shadowRoot.querySelector('.sending img');
      this.messageInput = this.shadowRoot.querySelector('.message-bar');
      this.div1 = this.shadowRoot.querySelector('.div1');
      this.div2 = this.shadowRoot.querySelector('.div2');
      this.div3 = this.shadowRoot.querySelector('.div3');
      this.div4 = this.shadowRoot.querySelector('.div4');
      this.modal = this.shadowRoot.querySelector('.modal');
      this.modalUser = this.shadowRoot.querySelector('.modal-user')
      this.modalContent = this.shadowRoot.querySelector('.modal-content');
      this.modalContent2 = this.shadowRoot.querySelector('.modal-content2');
      this.modalInput = this.shadowRoot.querySelector('.modal-input')
      this.userField = this.shadowRoot.querySelector('.user-field')
      this.chatBar = this.shadowRoot.querySelector('.chat-bar');
      this.chatContent = this.shadowRoot.querySelector('.chat-content');
      this.deleteButton = this.shadowRoot.querySelector('.delete-button');
      this.blockButton = this.shadowRoot.querySelector('.block-button');
      this.modalButton = this.shadowRoot.querySelector('.modal-button');
      this.modalButton2 = this.shadowRoot.querySelector('.modal-button2');
      this.modalButton3 = this.shadowRoot.querySelector('.modal-button3');
      this.modalButton4 = this.shadowRoot.querySelector('.modal-button4');
      this.modalCancelButton = this.shadowRoot.querySelector('.modal-cancel-button');
      this.modalCancelButton3 = this.shadowRoot.querySelector('.modal-cancel-button3');
      this.modalCancelButton4 = this.shadowRoot.querySelector('.modal-cancel-button4');
      this.messageBar = this.shadowRoot.querySelector('.message-bar');
      this.newChatPageButton = this.shadowRoot.querySelector('.new-chat-page button');
      this.conversations = this.shadowRoot.querySelector('.conversations');
      this.singleConversation = this.shadowRoot.querySelector('.single-conversation');
      this.newChatPage = this.shadowRoot.querySelector('.new-chat-page');
      this.conversationTopBar = this.shadowRoot.querySelector('.conversation-top-bar');
      this.mainChat = this.shadowRoot.querySelector('.main-chat');
      this.sending = this.shadowRoot.querySelector('.sending');
      this.rightMessage = this.shadowRoot.querySelector('.right-message');
      this.leftMessage = this.shadowRoot.querySelector('.left-message');
      this.currentConversation = null;
      this.sideSearchBar = this.shadowRoot.querySelector('.search-message input');
      this.singleConversationList = [];
      this.socket;
      this.deleteChat = this.shadowRoot.querySelector('.modal-delete-button');
      this.blockChat = this.shadowRoot.querySelector('.modal-block-button');
      this.unblockChat = this.shadowRoot.querySelector('.modal-unblock-button');
      this.playButton = this.shadowRoot.querySelector('.play-button');
      this.chats = this.shadowRoot.querySelector('.chats');
      this.blockList = [];
      this.currentUser;
      this.otherUser;
      this.plusIcon.addEventListener('click', this.addFriend.bind(this));

      this.modalButton.addEventListener('click', this.removeBlur.bind(this));

      this.modalButton2.addEventListener('click', this.removeBlur.bind(this));

      this.modalButton3.addEventListener('click', this.removeBlur.bind(this));

      this.modalButton4.addEventListener('click', this.removeBlur.bind(this));

      this.deleteButton.addEventListener('click', () => {
          this.chatBar.style.filter = 'blur(5px)';
          this.chatContent.style.filter = 'blur(5px)';
          this.modal.style.display = 'block';
          this.div1.style.display = 'none'
          this.div2.style.display = 'flex'
          this.div3.style.display = 'none'
          this.div4.style.display = 'none'
      })

      this.blockButton.addEventListener('click', () => {
        this.chatBar.style.filter = 'blur(5px)';
        this.chatContent.style.filter = 'blur(5px)';
        this.modal.style.display = 'block';
        this.div1.style.display = 'none'
        this.div2.style.display = 'none'
        this.div3.style.display = 'flex'
        this.div4.style.display = 'none'
    })
    
      this.playButton.addEventListener('click', () => { 
          this.chatBar.style.filter = 'blur(5px)';
          this.chatContent.style.filter = 'blur(5px)';
          this.modal.style.display = 'block';
          this.div1.style.display = 'none'
          this.div2.style.display = 'none'
          this.div3.style.display = 'none'
          this.div4.style.display = 'flex'
      })
      
      this.modalCancelButton.addEventListener('click', this.removeBlur.bind(this))
      
      this.modalCancelButton3.addEventListener('click', this.removeBlur.bind(this));
      
      this.modalCancelButton4.addEventListener('click', this.removeBlur.bind(this));
      
      this.newChatPageButton.addEventListener('click', this.addFriend.bind(this))
      
      // input handling
      
      this.sideSearchBar.addEventListener('input', (input) => {
          const value = input.target.value.toLowerCase();
          let matchingUsers = [];
          this.singleConversationList.forEach(singleConversationList => {
              let matchingUser = singleConversationList.single.querySelector('.li1').textContent.toLowerCase().includes(value);
              if (matchingUser)
                  matchingUsers.push(singleConversationList);
              })
          this.conversations.innerHTML = '';
          matchingUsers.forEach(user => {
              let newUser = this.conversations.appendChild(user.single.cloneNode(true));
              this.convClick(user.conv, newUser);
          })
      })
      
      this.modalInput.addEventListener('input', (input) => {
          const value = input.target.value.toLowerCase();
          getAccessToken()
          .then(accessToken => {
              return fetch('/api/list-users/', {
                  method: 'GET',
                  headers: {
                      'Authorization': `Bearer ${accessToken}`}
              })
          })
              .then(response => response.json())
              .then(data => data.forEach(user => {
                  let newUser = this.modalUser.cloneNode(true);
                  newUser.querySelector('.li1').textContent = user.username;
                  newUser.style.display = 'flex';
                  newUser.querySelector('.modal-img').src = user.image_url;
                  // userField.appendChild(newUser);
                  if (value != '') {
                      let matchingUser = newUser.querySelector('.li1').textContent.toLowerCase().includes(value);
                      if (matchingUser)
                      {
                          this.userField.appendChild(newUser);
                          this.startConversation(newUser, user); //image url not found
                      }
                  }
              }))
              .catch(error => console.error('Error:', error));
              this.userField.innerHTML = '';
      })

      this.listConversations();
      /****************************************************************************************************** */
      /****************************************************************************************************** */
      /****************************************************************************************************** */
      /****************************************************************************************************** */
      /***************************************END OF CONTRUCTOR   ******************************************* */
      /****************************************************************************************************** */
      /****************************************************************************************************** */
      /****************************************************************************************************** */
      /****************************************************************************************************** */
      /****************************************************************************************************** */
    }

    getTicBtn() {
        return this.shadowRoot.querySelector('.modal-tic-button');
    }

    getPongBtn() {
        return this.shadowRoot.querySelector('.modal-pong-button');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getOtherUser() {
        return this.otherUser;
    }

    connectedCallback() 
    {
      updateActiveNav("chat", this.shadowRoot);
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
      this.chatProcess();
    }

    disconnectedCallback() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN)
            this.socket.close()
        // matchingSocket = null
        // game_obj = null
      // Nettoyage de l'écouteur d'événement lors de la suppression du composant
    //   window.removeEventListener("resize", this.handleResize.bind(this));
    }

    logoutListener()
    {
      this.shadowRoot.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logoutProcess();
      })
    }

    async chatProcess() 
    {
      getUserInfos(this.shadowRoot);
      this.logoutListener();
    }

/************************************************************************************************************************************** */
/************************************************************************************************************************************** */
/************************************************************************************************************************************** */
/************************************************************************************************************************************** */
/************************************************************************************************************************************** */
/************************************************************************************************************************************** */
/***************************************                    CHAT JAVASC  ************************************************************** */
/************************************************************************************************************************************** */
/************************************************************************************************************************************** */
/************************************************************************************************************************************** */
/************************************************************************************************************************************** */
/************************************************************************************************************************************** */
/************************************************************************************************************************************** */

    

// export default (function(){




scrollBottom() {
    this.mainChat.scrollTop = this.mainChat.scrollHeight;
}

removeBlur = () => {
    this.chatBar.style.filter = 'none';
    this.chatContent.style.filter = 'none';
    this.modal.style.display = 'none';
    this.userField.innerHTML = '';
    this.modalInput.value = '';
}

addFriend = () => {
    this.chatBar.style.filter = 'blur(5px)';
    this.chatContent.style.filter = 'blur(5px)';
    this.modal.style.display = 'block';
    this.div1.style.display = 'flex';
    this.div2.style.display = 'none';
    this.div3.style.display = 'none';
    this.div4.style.display = 'none'
}





startConversation(singleUser, userData) {
    singleUser.addEventListener('click', () => {
        this.removeBlur();
        getAccessToken()
        .then(accessToken => {
            return fetch('/api/create-conv/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'user1_id': userData.id, 'user2_id': this.currentUser})
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data['status']) {
                    for (let i = 0; this.singleConversationList[i]; i++){
                        if (this.singleConversationList[i].conv.id == data.id)
                        {
                            this.convClickAction(this.singleConversationList[i].conv,
                                this.singleConversationList[i].single);
                            break;
                        }
                    }
                }
                else {
                    let newSingleConversation = this.singleConversation.cloneNode(true);
                    newSingleConversation.querySelector('.li1').textContent = userData.username;
                    newSingleConversation.style.display = 'flex';
                    newSingleConversation.querySelector('.cvr-img').src = userData.image_url;
                    let fullConv = {
                        'single': newSingleConversation,
                        'conv': { 'id': data.id, 'conversation': userData.username },
                    }
                    this.singleConversationList.push(fullConv);
                    this.conversations.appendChild(newSingleConversation);
                    // newSingleConversation.addEventListener('click', () => {
                    //     convClickAction({ 'id': data.id, 'conversation': userData.username }, singleUser);
                    // })
                    this.convClick({ 'id': data.id, 'conversation': userData.username }, newSingleConversation);
                    this.convClickAction({ 'id': data.id, 'conversation': userData.username, 'userImage': userData.image_url }, newSingleConversation);
                }
                // listConversations();
            })
            .catch(error => console.error('Error:', error));
    })
}


listConversations() {
    getAccessToken()
        .then(accessToken => {
            return fetch('/api/chat/', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${accessToken}`}
            })
        })
        .then(response => response.json())
        .then(data => {
            this.currentUser = data.conversations[0].currentUser;
            if (data.conversations[0].id != undefined) {
                data.conversations.forEach(conv => {
                    let newSingleConversation = this.singleConversation.cloneNode(true);
                    newSingleConversation.querySelector('.li1').textContent = conv.conversation;
                    newSingleConversation.style.display = 'flex';
                    let fullConv = {
                        'single': newSingleConversation,
                        'conv': conv,
                    }
                    
                    
                    newSingleConversation.querySelector('.cvr-img').src = conv.userImage;
                    this.singleConversationList.push(fullConv);
                    this.conversations.appendChild(newSingleConversation);
                    this.convClick(conv, newSingleConversation);
                })
            }
        })
        .catch(error => console.error('Error:', error));
}

convClick(conv, singleConv) {
    singleConv.addEventListener('click', () => {
        this.convClickAction(conv, singleConv);
    })
}

convClickAction(conv, singleConv) {
    this.otherUser = conv.conversation;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        
        this.socket.close(); // Close the current WebSocket
    }
    if (this.currentConversation)
        this.currentConversation.style.backgroundColor = '';
    this.currentConversation = singleConv;
    
    singleConv.style.backgroundColor = '#2E2E2E';
    this.newChatPage.style.display = 'none';
    this.conversationTopBar.style.display = 'flex';
    this.mainChat.style.display = 'flex';
    this.sending.style.display = 'flex';
    
    
    this.conversationTopBar.querySelector('.img-top-bar').src = conv.userImage;

    this.listMessages(conv);
    this.realTime(conv, singleConv);
}

listMessages(conv) {
    
    getAccessToken()
        .then(accessToken => {
            return fetch(`/api/chat/${conv.id}/`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${accessToken}`}
            })
    })
        .then(response => response.json())
        .then(data => {
            this.conversationTopBar.querySelector('.top-bar-right .p1').textContent = data.display_name;
            this.mainChat.innerHTML = '';
            data.messages.forEach(message => {
                if (message.sender == conv.conversation)
                {
                    let newLeftMessage = this.leftMessage.cloneNode(true);
                    newLeftMessage.querySelector('.left-message-p').textContent = message.content;
                    newLeftMessage.style.display = 'inline-block';
                    this.mainChat.appendChild(newLeftMessage);
                }
                else {
                    let newRightMessage = this.rightMessage.cloneNode(true);
                    newRightMessage.querySelector('.right-message-p').textContent = message.content;
                    newRightMessage.style.display = 'inline-block';
                    this.mainChat.appendChild(newRightMessage);
                }
                this.scrollBottom();
            })
        })
}

async realTime(conv, singleConv) {
    
    let token;
    await getAccessToken()
        .then(accessToken => {
            token = accessToken;
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        });
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN)
      this.socket = new WebSocket(`/ws/chat/${conv.id}/?Token=${token}`);
    this.socket.onmessage = ({ data }) => {
        let receivedMessage = JSON.parse(data);
        
        
        if (receivedMessage.type == 'send_message') {
            
            if (receivedMessage.message && receivedMessage.message.trim() != '')
            {
                
                
                if (conv.conversation == receivedMessage.user)
                {
                    
                    let newLeftMessage = this.leftMessage.cloneNode(true);
                    newLeftMessage.querySelector('.left-message-p').textContent = receivedMessage.message;
                    newLeftMessage.style.display = 'inline-block';
                    this.mainChat.appendChild(newLeftMessage);
                }
                else
                {
                    
                    let newRightMessage = this.rightMessage.cloneNode(true);
                    newRightMessage.querySelector('.right-message-p').textContent = receivedMessage.message;
                    newRightMessage.style.display = 'inline-block';
                    this.mainChat.appendChild(newRightMessage);
                }
                    
            }
            this.scrollBottom();
        }
        else if (receivedMessage.type == 'delete_message') {
            let messages;
            if (conv.conversation == receivedMessage.user)
                messages = this.mainChat.querySelectorAll('.left-message');
            else
                messages = this.mainChat.querySelectorAll('.right-message');
            messages.forEach(message => {
                

                message.remove();
            })
            this.removeBlur();
        }
        else if (receivedMessage.type == 'block_user') {
            
            
            
            this.blockList.push(conv.id);
            this.disableMessageBar();
            this.removeBlur();
            if (this.currentUser == receivedMessage.blocked) {
                this.blockButton.disabled = true;
                this.playButton.disabled = true;
            }
            else {
              this.playButton.disabled = true;
              this.blockChat.style.display = 'none';
              this.unblockChat.style.display = 'block';
              this.div3.querySelector('.modal-content3 .modal-delete-message3').textContent = 'UNBLOCK THIS USER?'
            }
        }
        else if (receivedMessage.type == 'unblock_user') {
            
            this.enableMessageBar();
            this.removeBlur();
            this.blockButton.disabled = false;
            this.playButton.disabled = false;
            this.blockChat.style.display = 'block';
            this.unblockChat.style.display = 'none';
            this.div3.querySelector('.modal-content3 .modal-delete-message3').textContent = 'BLOCK THIS USER?'
        }
    }
    this.socket.onopen = () => {
        this.enableMessageBar();
        this.blockButton.disabled = false;
        this.playButton.disabled = false;
        this.blockChat.style.display = 'block';
        this.unblockChat.style.display = 'none';
        this.div3.querySelector('.modal-content3 .modal-delete-message3').textContent = 'BLOCK THIS USER?'
        this.sendButton.addEventListener('click', () => {
            if (this.messageInput.value)
            {
                if (this.messageInput.value.trim() != '') {
                    let jsonMessage = {'message': this.messageInput.value, 'user': singleConv.querySelector('.li1').textContent}
                    this.socket.send(JSON.stringify(jsonMessage));
                }
                this.messageInput.value = '';
            }
        })
        
        this.messageBar.addEventListener('keydown', (event) => {
            if (event.key == 'Enter' && this.messageInput.value)
            {
                if (this.messageInput.value.trim() != '') {
                    let jsonMessage = {'message': this.messageInput.value, 'user': singleConv.querySelector('.li1').textContent}
                    this.socket.send(JSON.stringify(jsonMessage));
                }
                this.messageInput.value = '';
            }
        })

        this.deleteChat.addEventListener('click', () => {
            let action = { 'action': 'delete', 'sender_id': `${this.currentUser}` };
            this.socket.send(JSON.stringify(action));
        })

        this.blockChat.addEventListener('click', () => {
            let action = { 'action': 'block' };
            this.socket.send(JSON.stringify(action));
        })

        this.unblockChat.addEventListener('click', () => {
            let action = { 'action': 'unblock' };
            this.socket.send(JSON.stringify(action));
        })
    }
}

disableMessageBar() {
    this.messageBar.placeholder = 'You cannot send a message to this user';
    this.messageBar.style.textAlign = 'center';
    this.messageBar.value = '';
    this.messageBar.disabled = true;
    this.sendButton.disabled = true;
    this.sendButton.style.cursor = 'default';
}

enableMessageBar() {
    this.messageBar.placeholder = 'Type a message...';
    this.messageBar.style.textAlign = 'left';
    this.messageBar.value = '';
    this.messageBar.disabled = false;
    this.sendButton.disabled = false;
    this.sendButton.style.cursor = 'pointer';
}

getAccessToken() {
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




// })();


    
}
  
customElements.define("chat-page", ChatPage);





