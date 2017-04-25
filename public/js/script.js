(function () {
    function Message(type, name, text) {
        this.type = type;
        this.name = name;
        this.text = text;
    }

    var socket = io();

    Vue.component('login', {
        template: '#login',

        data: function () {
            return {

            }
        },
        
        methods: {
            loginUser: function (e) {
                var username = e.target.value.trim();

                if (username.length) {
                    socket.emit('add user', username);
                    this.$emit('view', 'chat');
                }

                e.target.value = '';
            }
        }
    });

    Vue.component('chat', {
        template: '#chat',

        data: function () {
            return {
                messages: []
            }
        },

        created: function () {
            socket.on('user joined', function (data) {

                console.log('asd');
            });
        }
    });

    var vue = new Vue({
        el: '#app',

        components: ['login', 'chat'],

        data: {
            currentView: 'login'
        },

        methods: {
            changeView: function (view) {
                this.currentView = view;
            }
        },

        created: function () {

        }
    });
}());