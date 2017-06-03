const colors = require('colors/safe');

function on_user_message (msg) {
    if (!this.ws.user) return;

    switch (msg['$']) {
        case 'speak':
            send_to_all({'$': 'speak', t: msg.t, u: this.ws.user.id}, this.ws.user.id);
            break;
    }
}

function on_message (msg) {
    const user = this.ws.user;
    ws_log(`msg for [${user ? user.id : 'unknown'}]`, msg);
    msg = JSON.parse(msg);

    switch (msg['$']) {
        case 'in':
            const new_user = {id: Number(msg.user.id), name: String(msg.user.name), ws: this.ws};
            if (PRESENT_USERS.has(new_user.id)) return;

            if (user) PRESENT_USERS.delete(user.id);
            this.ws.user = new_user;
            PRESENT_USERS.set(new_user.id, new_user);

            ws_log(`in: ${new_user.name} [${new_user.id}]`);
            present_users_changed();
            break;

        case 'out':
            if (user) {
                this.ws.user = null;
                PRESENT_USERS.delete(user.id);

                ws_log(`out: ${user.name} [${user.id}]`);
                present_users_changed();
            }
            break;

        case 'ping':
            this.send({'$': 'pong', d: msg.d});
            break;

        default:
            on_user_message.call(this, msg);
            break;
    }
}

const ws_handler_creator = function (ws_app) {
    return function(ws, req) {
        try {
            const context = {
                ws_app,
                ws,
                req,
                send: function (msg) {
                    ws.send(JSON.stringify(msg));
                }
            };

            ws.on('close', function () {
               ws_log('client disconnected');
               if (ws.user) on_message.call(context, JSON.stringify({'$': 'out'}));
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

        user.ws.send(msg);
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