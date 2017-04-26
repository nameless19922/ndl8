const data = require('./data');

function findRoom(rooms, room) {
    var result = -1;

    if (rooms.length) {
        result = rooms.findIndex(item => item.name === room);
    }

    return result;
}

module.exports = {
    addUser: (username, socket) => {
        socket.username = username;
        data.addedUser = true;

        socket.emit('rooms', {
            rooms: data.rooms
        });
    },

    newRoom: (room, socket) => {
        socket.broadcast.emit('new room', {
            room
        });

        data.rooms.push({
            name: room,
            online: 0
        });
    },

    joinRoom: (room, socket) => {
        let find = findRoom(data.rooms, room);

        if (find !== -1) {
            socket.room = room;
            socket.join(room);

            data.rooms[find].online++;

            socket.emit('login', {
                username: socket.username,
                online: data.rooms[find].online
            });

            socket.broadcast.in(socket.room).emit('user joined', {
                username: socket.username,
                online: data.rooms[find].online
            });
        }
    },

    newMessage: (message, socket) => {
        socket.broadcast.in(socket.room).emit('new message', {
            username: socket.username,
            message
        });
    },

    leaveUser: socket => {
        if (socket.room) {
            let find = findRoom(data.rooms, socket.room);

            if (data.addedUser && find !== -1) {
                data.rooms[find].online--;

                socket.leave(socket.room);

                socket.broadcast.in(socket.room).emit('user left', {
                    username: socket.username,
                    online: data.rooms[find].online
                });
            }
        }
    }
}