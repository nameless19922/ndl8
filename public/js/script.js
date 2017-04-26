(function () {
    function Message(type, name, text) {
        this.type = type;
        this.name = name;
        this.text = text;
    }

    function Room(name) {
        this.name = name;
    }

    var socket = io(),

        store = {
            state: {
                rooms    : [],
                messages : [],

                username : '',
                room     : '',
                online   : 0
            },

            addMessage: function (message) {
                this.state.messages.push(message);
            },

            clearMessages: function () {
                this.state.messages.splice(0);
            },

            addRoom: function (room) {
                this.state.rooms.push(room);
            },

            removeRoom: function (index) {
                this.state.rooms.splice(index, 1);
            }
        };

    Vue.component('login', {
        template: '#login',

        data: function () {
            return {
                shared: store.state
            }
        },

        methods: {
            loginUser: function (e) {
                var username = e.target.value.trim();

                if (username.length) {
                    socket.emit('add user', username);

                    this.shared.username = username;
                    this.$emit('changeview', 'rooms');
                }

                e.target.value = '';
            }
        }
    });

    Vue.component('rooms', {
        template: '#rooms',

        data: function () {
            return {
                shared    : store.state,
                inputRoom : ''
            }
        },

        methods: {
            addRoom: function () {
                var room   = this.inputRoom.trim(),
                    result = 0;

                if (room.length) {
                    result = this.shared.rooms.filter(function (item) {
                        return item.name === room;
                    });

                    if (!result.length) {
                        socket.emit('new room', room);
                        store.addRoom(
                            new Room(room)
                        );
                    } else {
                        alert('This room already exists');
                    }
                }

                this.inputRoom = '';
            },
            
            setRoom: function (room) {
                socket.emit('join room', room.name);

                this.shared.room = room.name;
                this.$emit('changeview', 'chat');
            },

            removeRoom: function (index) {
                if (this.shared.rooms.length) {
                    store.removeRoom(index);
                }
            }
        }
    });

    Vue.component('chat', {
        template: '#chat',

        data: function () {
            return {
                shared       : store.state,
                inputMessage : ''
            }
        },

        methods: {
            addMessage: function () {
                var message = this.inputMessage.trim();

                if (message.length) {
                    socket.emit('new message', message);
                    store.addMessage(
                        new Message('message', this.shared.username + ' (you)', message)
                    );

                    this.scrollToEnd();
                }

                this.inputMessage = '';
            },

            switchRoom: function () {
                this.$emit('changeview', 'rooms');
                socket.emit('leave room');

                store.clearMessages();
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
            currentView: 'login'
        },

        methods: {
            setView: function (view) {
                this.currentView = view;
            }
        }
    });

    socket.on('login', function (data) {
        store.addMessage(
            new Message('service', data.username, 'Hello, ' + data.username + '!')
        );

        store.state.online = data.online;
    });

    socket.on('rooms', function (data) {
        if (data.rooms.length) {
            store.state.rooms = data.rooms.slice();
        }
    })

    socket.on('user joined', function (data) {
        store.addMessage(
            new Message('service', data.username, data.username + ' connected')
        );

        store.state.online = data.online;
    });

    socket.on('user left', function (data) {
        store.addMessage(
            new Message('service', data.username, data.username + ' disconnected')
        );

        store.state.online = data.online;
    });

    socket.on('new room', function (data) {
        store.addRoom(
            new Room(data.room)
        );
    });

    socket.on('new message', function (data) {
        store.addMessage(
            new Message('new-message', data.username, data.message)
        );
    });
}());
