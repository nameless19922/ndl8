const express = require('express');
const app     = express();
const server  = require('http').createServer(app);
const io      = require('socket.io')(server);


module.exports = port => {
    let numberUsers = 0;

    server.listen(port, function () {
        console.log(`Server listening at port ${port}`);
    });

    app.use(express.static(__dirname + '/public'));

    io.on('connection', socket => {
        socket.on('add user', function (username) {
            numberUsers++;
            socket.username = username;

            io.sockets.emit('user joined', {
                username: socket.username,
                numberUsers: numberUsers
            });
        });

    });
}