const express  = require('express');
const app      = express();
const server   = require('http').createServer(app);
const io       = require('socket.io')(server);

const handlers = require('./handlers');

module.exports = port => {
    server.listen(port, () => {
        console.log(`Server listening at port ${port}`);
    });

    app.use(express.static(__dirname + '/public'));

    io.on('connection', socket => {
        socket.on('add user', username => {
            handlers.addUser(username, socket);
        });

        socket.on('new room', room => {
            handlers.newRoom(room, socket);
        });

        socket.on('join room', room => {
            handlers.joinRoom(room, socket);
        });

        socket.on('new message', message => {
            handlers.newMessage(message, socket);
        });

        socket.on('leave room', () => {
            handlers.leaveUser(socket);
        });

        socket.on('disconnect', () => {
            handlers.leaveUser(socket);
        });
    });
}