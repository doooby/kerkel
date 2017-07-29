const colors = require('colors/safe');
const User = require('../lib/user');

const user_messages = {

    speak: function (msg) {
        send_to_all({'$': 'speak', text: msg.text, user: this.user.id}, this.user.id);
    },

    game_invite: function (msg) {
        const opponent = msg.opponent && PRESENT_USERS.get(Number(msg.opponent));
        if (!opponent) {
            this.respond(msg, {fail: 'bad opponent'});
            return false;
        }

        this.user.tryInitGame(opponent, msg);
    }

};

function on_message (msg) {
    if (!msg['$']) return;
    const user = this.user;

    switch (msg['$']) {
        case 'in':
            const err = this.connectUser(msg.user.id, msg.user.name);
            if (err) {
                ws_log(`connection error: ${err}`);
            } else {
                ws_log(`in: ${this.user.name} [${this.user.id}]`);
                present_users_changed();
            }
            break;

        case 'out':
            if (user) {
                PRESENT_USERS.delete(user.id);
                this.user = null;
                ws_log(`out: ${user.name} [${user.id}]`);
                if (user.game) {
                    user.game.opponent.game.clear();
                    user.game.clear();
                }
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
            const context = new Context(ws);

            ws.on('close', function () {
                context.disconected = true;
                ws_log('client disconnected');
                if (context.user) on_message.call(context, {'$': 'out'});
            });

            ws.on('message', (json_text) => {
                ws_log(`msg from [${this.user ? this.user.id : 'unknown'}]`, json_text);
                const msg = JSON.parse(json_text);
                on_message.call(context, msg);
            });
            ws_log('client connected');
        }
        catch (e) {
            ws_log(colors.red('handler error'));
            console.error(e);
        }
    };
};

class Context {

    constructor (ws) {
        this.ws = ws;
        this.user = null;
        this.disconected = false;
    }

    send (msg) {
        if (this.disconected) return;
        if (typeof msg !== 'string') msg = JSON.stringify(msg);
        if (this.user) ws_log(`msg for [${this.user.id}]`, msg);
        this.ws.send(msg, function (err) {
            if (err) ws_log(colors.bold.red('send fail'), err);
        });
    }

    respond ({req_id}, data) {
        // console.log(req_id, data);
        if (typeof req_id !== 'number') return;
        if (!data) data = {};
        data.req_id = req_id;
        data['$'] = 'response';
        this.send(data);
    }

    connectUser (id, name) {
        if (this.user) return 'cannot reconnect';

        const user = new User(this, id, name);
        if (PRESENT_USERS.has(user.id)) return 'already present';

        this.user = user;
        PRESENT_USERS.set(user.id, user);
    }

}


function send_to_all (msg, skip_id) {
    msg = JSON.stringify(msg);
    PRESENT_USERS.forEach(user => {
        if (user.id === skip_id) return;

        user.context.send(msg);
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

if (process.env.NODE_ENV === 'test') {
    // to be testable
    ws_handler_creator.Context = Context;
    ws_handler_creator.PRESENT_USERS = PRESENT_USERS;
    ws_handler_creator.on_message = on_message;

    // do not log
    ws_log = () => {}
}