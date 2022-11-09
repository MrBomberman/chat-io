const chatForm = document.querySelector('#chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.querySelector('#room-name');
const usersNames = document.querySelector('#users');

// get username and room from the url

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})


const socket = io();

// join chat room

socket.emit('joinRoom', {username, room });

// get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

// get message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
    // scroll down every time we get a message
    chatMessages.scrollTop = chatMessages.scrollHeight; // кол-во пикселей от верха блока = высоте блока с контетом , 
    //чтобы слистывать вниз автоматически - включая последний элемент
})

// message submit 
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value; // get message from chat by id
    // send message to server 
    socket.emit('chatMessage',msg) 

    // clear input 
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus()
})

// output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div)
}

// add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// add users to DOM
function outputUsers(users){
    usersNames.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}