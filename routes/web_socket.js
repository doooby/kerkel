const colors = require('colors/safe');
const Game = require('../lib/game');

const user_messages = {

    speak: function (msg) {
        send_to_all({'$': 'speak', t: msg.t, u: this.user.id}, this.user.id);
    },

    'game-invite': function (msg) {
        const opponent = msg.opponent && PRESENT_USERS.get(msg.opponent);
        if (!opponent) {
            this.respond(msg, {fail: 'bad opponent'});
            return false;
        }

        if (this.user.game !== null) {
            this.respond(msg, {fail: 'you are already in game'});
        }

        if (opponent.game !== null) {
            this.respond(msg, {fail: 'opponent already in game'});
        }

        this.user.game = new Game(opponent);
        this.respond(msg);

        opponent.game = new Game(this.user);
        opponent.send({'$': 'game-invitation', host: this.user.id});
    }

};

function on_message (msg) {
    ws_log(`msg from [${this.user ? this.user.id : 'unknown'}]`, msg);
    msg = JSON.parse(msg);
    if (!msg['$']) return;

    switch (msg['$']) {
        case 'in':
            const new_user = {
                id: Number(msg.user.id),
                name: String(msg.user.name),
                send: this.send,
                game: null
            };
            if (PRESENT_USERS.has(new_user.id)) return;

            if (this.user) PRESENT_USERS.delete(this.user.id);
            this.user = new_user;
            PRESENT_USERS.set(new_user.id, new_user);

            ws_log(`in: ${new_user.name} [${new_user.id}]`);
            present_users_changed();
            break;

        case 'out':
            if (this.user) {
                PRESENT_USERS.delete(this.user.id);

                ws_log(`out: ${this.user.name} [${this.user.id}]`);
                if (this.user.game) this.user.game.clear();
                this.user = null;
                present_users_changed();
            }
            break;

        case 'ping':
            this.send({'$': 'pong', d: msg.d});
            break;

        default:
            if (this.user) {
                const action_handler = user_messages[msg['$']];
                if (action_handler) action_handler.call(this, msg);
            }
            break;
    }
}

const ws_handler_creator = function (ws_app) {
    return function(ws, req) {
        try {
            const context = {
                user: null,
                // req,
                // ws_app,
                ws,

                send: function (msg) {
                    if (context.disconected) return;
                    if (typeof msg !== 'string') msg = JSON.stringify(msg);
                    ws_log(`msg for [${context.user.id}]`, msg);
                    ws.send(msg);
                },

                respond: function ({req_id}, data) {
                    // console.log(req_id, data);
                    if (!data) data = {};
                    if (typeof req_id === 'number')
                        context.send({'$': 'response', req_id, data});
                }
            };

            ws.on('close', function () {
                context.disconected = true;
                ws_log('client disconnected');
                if (context.user) on_message.call(context, JSON.stringify({'$': 'out'}));
            });

            ws.on('message', on_message.bind(context));
            ws_log('client connected');
        }
        catch (e) {
            ws_log(colors.red('handler error'));
            console.error(e);
        }
    };
};

function send_to_all (msg, skip_id) {
    msg = JSON.stringify(msg);
    PRESENT_USERS.forEach(user => {
        if (user.id === skip_id) return;

        user.send(msg);
    });
}

const PRESENT_USERS = new Map();

function present_users_changed () {
    send_to_all({
        '$': 'present_users',
        users: Array.from(PRESENT_USERS.values()).map(user => [user.id, user.name])
    });
}

function ws_log (...args) {
    console.log(colors.bold.gray('WS'), ...args);
}

module.exports = ws_handler_creator;