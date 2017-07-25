const colors = require('colors/safe');

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

        this.respond(msg, {fail: 'not implemented'});
    }

};

function on_message (msg) {
    ws_log(`msg from [${this.user ? this.user.id : 'unknown'}]`, msg);
    msg = JSON.parse(msg);

    switch (msg['$']) {
        case 'in':
            const new_user = {id: Number(msg.user.id), name: String(msg.user.name), send: this.send};
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
                this.user = null;
                present_users_changed();
            }
            break;

        case 'ping':
            this.send({'$': 'pong', d: msg.d});
            break;

        default:
            if (this.user) {
                let user_action = msg['$'] || '';
                user_action = user_messages[user_action];
                if (typeof user_action === 'function') user_action.call(this, msg);
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
                    if (typeof msg !== 'string') msg = JSON.stringify(msg);
                    ws_log(`msg for [${context.user.id}]`, msg);
                    ws.send(msg);
                },

                respond: function ({req_id, $}, data) {
                    // console.log(req_id, $, data);
                    if (typeof req_id === 'number' && typeof $ === 'string')
                        context.send({'$': 'response', req_id, req_$: $, data});
                }
            };

            ws.on('close', function () {
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