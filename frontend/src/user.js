import app_utils from './app_utils';
import actions from './actions';
import App from './app';

export default class User {

    constructor ({id, name}) {
        this.id = Number(id);
        this.name = name;
        this.status = true;

        this.color = 0xffffff;

        this._on_status_changed = [];
        this['changed'] = () => {
            this._on_status_changed.forEach(clbk => clbk(this));
        }
    }

    assignNewColor () {
        this.color = app_utils.next_color();
    }

    onStatusChanged (callback) {
        if (typeof callback !== 'function') throw 'User#onStatusChanged: bad arg';
        this._on_status_changed.push(callback);
    }

    subscribeToWs () {
        const ws = new WebSocket('ws://'+window.location.host+'/ws');

        // const pinger = function () {
        //     ws.send(JSON.stringify({'$': 'ping', d: Date.now()}));
        // };

        ws.onopen = () => {
            // pinger();
            // this.pinger_interval = setInterval(pinger, 10000);

            ws.send(JSON.stringify({
                '$': 'in',
                user: {id: this.id, name: this.name}
            }));
        };

        ws.onclose = () => {
            if (this.ws === ws) this.ws = null;

            // if (this.pinger_interval) {
            //     clearInterval(this.pinger_interval);
            //     this.pinger_interval = null;
            // }

            console.log('disconnected');
        };

        ws.onmessage = e => {
            let data = null;
            try { data = JSON.parse(e.data); } catch (e) {}
            if (data === null || !data['$']) return;

            switch (data['$']) {
                case 'pong':
                    const ping = (Date.now() - data.d);
                    console.log(`ping-pong: ${ping} ms`);
                    break;

                default:
                    // console.log(data);
                    const handler = messages_handlers[data['$']];
                    if (handler) handler.call(this, data);
                    break;
            }

            // console.log(`Roundtrip time: ${Date.now() - message.data} ms`);

            // setTimeout(function timeout() {
            //     ws.send(Date.now());
            // }, 2000);
        };

        ws.onerror = function (error) {
            console.log(error);
        };

        this.ws = ws;
        this.pending_requests = new Map();
    }

    unsubscribeFromWs () {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.pending_requests = null;
        }
    }

    speak (message) {
        if (this.ws) {
            this.ws.send(JSON.stringify({'$': 'speak', t: message}));
            const message = App.createMessage(message, this);
            this.app.redux_store.dispatch(actions.addMessage(message));
        }
    }

    sendMessageTo (user_id, data) {
        data.to = user_id;
        console.log('user.sendMessageTo', data);
        // this.appSubscription.perform('send_to', data);
    }

    sendRequest (action, data, callback) {
        data.$ = action;
        const req = new Request(data, this, callback);
        req.prepare();
        this.ws.send(JSON.stringify(req.req_data));
        return req;
    }

}

const messages_handlers = {
    response: function (data) {
        const request = data.req_id && this.pending_requests.get(data.req_id);
        if (request) { request.performResponse(data.data); }
    },

    present_users: function (data) {
        const users_list = data.users.map(arr => ({id: arr[0], name: arr[1]}));
        this.app.redux_store.dispatch(actions.usersListChanged(users_list));

    },

    speak: function (data) {
        const person = this.app.getUser(data.u);
        if (person) {
            const message = App.createMessage(data.t, person);
            this.app.redux_store.dispatch(actions.addMessage());
        }
    },

    'game-invitation': function (data) {
        const action = actions.gamePending(this.app, data.host, false);
        if (action) this.app.redux_store.dispatch(action);
    },

    'game-abandoned': function () {
        const game = this.app.getState().game;
        if (game) this.app.redux_store.dispatch(actions.gameAbandoned());
    }

};

User.get_login = function (clbk) {
    fetch('/recognition', {
        credentials: 'include'
    })
        .then(reponse => reponse.json())
        .then(clbk);
};

User.post_login = function (name, clbk) {
    let data = new FormData();
    data.append('name', name);

    fetch('/login', {
        method: 'POST',
        credentials: 'include',
        body: data
    })
        .then(reponse => reponse.json())
        .then(clbk);
};

User.post_logout = function (clbk) {
    fetch('/logout', {
        method: 'POST',
        credentials: 'include'
    })
        .then(clbk);
};

class Request {

    constructor (data, user, waiter) {
        this.waiter = waiter;
        this.req_data = data;
        this.user = user;

        this.req_data.req_id = app_utils.random_number(10);
    }

    performResponse (data) {
        this.resp_data = data;
        this.fail = data.fail;
        this.finalize();
        this.waiter(this);
    }

    prepare () {
        this.user.pending_requests.set(this.req_data.req_id, this);
        this._clearTimeout = Request.attachTimeout(this);
    }

    finalize () {
        this.user.pending_requests.delete(this.req_data.req_id);
        this._clearTimeout();
    }

}

Request.attachTimeout = function (req) {
    let timeout = setTimeout(() => {
        timeout = null;
        req.performResponse({fail: 'timeout'});
    }, 5000);

    return () => { if (timeout) clearTimeout(timeout); };
};