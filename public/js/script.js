(function () {
    var socket = io();

    function Message(type, name, text) {
        this.type = type;
        this.name = name;
        this.text = text;
    }

    function Room(name) {
        this.name = name;
    }

    Vue.component('login', {
        template: '#login',

        methods: {
            loginUser: function (e) {
                var username = e.target.value.trim();

                if (username.length) {
                    socket.emit('add user', username);
                    this.$emit('showrooms', username);
                }

                e.target.value = '';
            }
        }
    });

    Vue.component('rooms', {
        template: '#rooms',

        props: ['rooms', 'username'],

        methods: {
            addRoom: function (e) {
                var room   = e.target.value.trim(),
                    result = 0;

                if (room.length) {
                    result = this.rooms.filter(function (item) {
                        return item.name === room;
                    })

                    if (!result.length) {
                        socket.emit('new room', room);
                        this.rooms.push(
                            new Room(room)
                        );
                    } else {
                        alert('This room already exists');
                    }
                }

                e.target.value = '';
            },
            
            setRoom: function (room) {
                socket.emit('join room', room.name);
                this.$emit('showchat', room.name);
            },

            removeRoom: function (index) {
                if (this.rooms.length) {
                    this.rooms.splice(index, 1);
                }
            }
        }
    });

    Vue.component('chat', {
        template: '#chat',

        props: ['messages', 'username', 'online', 'room'],

        methods: {
            addMessage: function (e) {
                var message = e.target.value.trim();

                if (message.length) {
                    socket.emit('new message', message);
                    this.messages.push(
                        new Message('message', this.username + ' (you)', message)
                    );

                    this.scrollToEnd();
                }

                e.target.value = '';
            },

            switchRoom: function () {
                this.$emit('showrooms', this.username);
                socket.emit('leave room');
                this.messages.splice(0);
            },

            scrollToEnd: function() {
                let chat = this.$el.querySelector('.js-chat');

                chat.scrollTop = chat.scrollHeight;
            },
        }
    });

    var vm = new Vue({
        el: '#app',

        components: ['login', 'chat'],

        data: {
            currentView : 'login',
            username    : '',
            room        : '',
            messages    : [],
            rooms       : [],
            online      : 0,
            connected   : false
        },

        methods: {
            showChat: function (room) {
                this.currentView = 'chat';
                this.room        = room;
            },

            showRooms: function (username) {
                this.currentView = 'rooms';
                this.username    = username;
            }
        }
    });

    socket.on('login', function (data) {
        vm.messages.push(
            new Message('service', data.username, 'Hello, ' + data.username + '!')
        );

        vm.online    = data.online;
        vm.connected = true;
    });

    socket.on('rooms', function (data) {
        if (data.rooms.length) {
            vm.rooms = data.rooms.slice();
        }
    })

    socket.on('user joined', function (data) {
        vm.messages.push(
            new Message('service', data.username, data.username + ' connected')
        );

        vm.online = data.online;
    });

    socket.on('user left', function (data) {
        vm.messages.push(
            new Message('service', data.username, data.username + ' disconnected')
        );

        vm.online    = data.online;
        vm.connected = false;
    });

    socket.on('new room', function (data) {
        vm.rooms.push(
            new Room(data.room)
        );
    });

    socket.on('new message', function (data) {
        vm.messages.push(
            new Message('new-message', data.username, data.message)
        );
    });
}());