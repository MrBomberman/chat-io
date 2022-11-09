const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin , getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = 'Cat Bot';

// set Static folder
app.use(express.static(path.join(__dirname, 'public'))) // из главной папки, в которой мы находимся обращаемся к папке public

// run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)
        // welcome current user
        socket.emit('message', formatMessage(botName,'Welcome to chat!')); // inform a single client

        // broadcast when a user connects // to emit a specific room 
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName,`${user.username} has joined the chat`)); // it will see everybody instead of user that has connected or disconnected
        //io.emit() // to send to all clients in general

        // send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username, msg)); // to send message everyone in the chat
    })

    // runs when client disconnects

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`))
        }

        // send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });
})

const PORT = 3000 || process.env.PORT;


server.listen(PORT,'192.168.0.10'); // to run a server om port
