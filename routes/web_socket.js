const colors = require('colors/safe');

function on_user_message (msg) {

}

function on_system_message (msg) {
    switch (msg['t']) {
        case 'in':
            const user = {id: Number(msg.user.id), name: String(msg.user.name), ws: this.ws};
            if (PRESENT_USERS.has(user.id)) return;
            if (this.ws.user) PRESENT_USERS.delete(this.ws.user.id);
            this.ws.user = user;
            PRESENT_USERS.set(user.id, user);
            present_users_changed();
            break;

        case 'out':
            if (this.ws.user) {
                PRESENT_USERS.delete(this.ws.user.id);
                this.ws.user = null;
                present_users_changed();
            }
            break;
    }
}

function on_message (msg) {
    msg = JSON.parse(msg);
    // ws_log('msg', msg);
    switch (msg['$']) {
        case 'sys':
            on_system_message.call(this, msg);
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
               ws_log('client disconnected', (ws.user && ws.user.id));
               if (ws.user) on_system_message.call(context, {'$': 'sys', t: 'out'});
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

const PRESENT_USERS = new Map();

function present_users_changed () {
    const entries = Array.from(PRESENT_USERS.values());
    const msg = JSON.stringify({
        t: 'present_users',
        users: entries.map(user => [user.id, user.name])
    });
    entries.forEach(user => user.ws.send(msg));
}

function ws_log (...args) {
    console.log(colors.bold.gray('WS'), ...args);
}

module.exports = ws_handler_creator;